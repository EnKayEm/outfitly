from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from database.models import Cloth, Category, OutfitlyUser
from .ai_service import analyze_cloth_image
from .ai_service import generate_stylization

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_and_analyze_cloth(request):
    if 'image' not in request.FILES:
        return Response({'error': 'Brak zdjęcia w zapytaniu.'}, status=status.HTTP_400_BAD_REQUEST)

    image_file = request.FILES['image']
    
    user = request.user
    if not user:
        return Response({'error': 'Musisz najpierw stworzyć użytkownika w bazie (np. przez panel admina).'}, status=status.HTTP_400_BAD_REQUEST)

    cloth = Cloth.objects.create(user=user)
    cloth.image = image_file
    cloth.save()

    ai_data = analyze_cloth_image(cloth.image.path)

    if not ai_data:
        cloth.delete()
        return Response({'error': 'AI nie dało rady przeanalizować zdjęcia.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    cloth.color = ai_data.get('color', '')
    cloth.description = ai_data.get('description', '')
    cloth.save()

    categories = ai_data.get('categories', [])

    if 'category' in ai_data:
        if isinstance(ai_data['category'], list):
            categories.extend(ai_data['category'])

        elif isinstance(ai_data['category'], str):
            categories.append(ai_data['category'])

    categories = list(set(categories))
    
    for cat_name in categories:
        category_obj, created = Category.objects.get_or_create(name=cat_name)
        category_obj.clothes.add(cloth)

    return Response({
        'message': 'Ubranie dodane i z sukcesem przeanalizowane przez AI!',
        'cloth_id': cloth.id,
        'ai_analysis': ai_data
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def suggest_outfit(request):
    occasion = request.data.get('occasion')
    if not occasion:
        return Response({'error': 'Musisz podać okazję (klucz "occasion").'}, status=status.HTTP_400_BAD_REQUEST)

    user = request.user
    clothes = Cloth.objects.filter(user=user)

    if not clothes.exists():
        return Response({'error': 'Szafa jest pusta! Dodaj najpierw jakieś ubrania.'}, status=status.HTTP_400_BAD_REQUEST)

    wardrobe_data = []
    for cloth in clothes:
        categories = list(cloth.category_set.values_list('name', flat=True))
        
        wardrobe_data.append({
            'id': cloth.id,
            'color': cloth.color,
            'description': cloth.description,
            'categories': categories
        })

    ai_data = generate_stylization(wardrobe_data, occasion)

    if not ai_data or 'outfit_ids' not in ai_data:
        return Response({'error': 'AI nie było w stanie wygenerować stylizacji.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({
        'occasion': occasion,
        'suggested_outfit_ids': ai_data['outfit_ids'],
        'message': 'Oto propozycja stylizacji od Twojego osobistego asystenta!'
    }, status=status.HTTP_200_OK)