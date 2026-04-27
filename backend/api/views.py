from django.shortcuts import render
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from database.models import Cloth, Category, OutfitlyUser, Composition
from .ai_service import analyze_cloth_image
from .ai_service import generate_stylization

# Endpoint do uploadu zdjęcia ubrania i jego analizy przez AI - POST /api/clothes/upload/
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

# Sugestia stylizacji na podstawie szafy i okazji - POST /api/clothes/suggest/
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

    outfit_ids = ai_data['outfit_ids']

    if outfit_ids:
        composition = Composition.objects.create(
            user=request.user,
            target_event=occasion
        )
        composition.clothes.set(outfit_ids)

    return Response({
        'occasion': occasion,
        'suggested_outfit_ids': outfit_ids,
        'composition_id': new_composition.id if outfit_ids else None,
        'message': 'Stylizacja została wygenerowana i zapisana w Twojej kolekcji!'
    }, status=status.HTTP_200_OK)

# Pobieranie wszystkich ubrań użytkownika - GET /api/clothes/
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_clothes(request):
    clothes = Cloth.objects.filter(user=request.user)
    
    data = []
    for cloth in clothes:
        data.append({
            'id': cloth.id,
            'color': cloth.color,
            'description': cloth.description,
            'image_url': request.build_absolute_uri(cloth.image.url) if cloth.image else None,
            'categories': list(cloth.category_set.values_list('name', flat=True))
        })
        
    return Response(data, status=status.HTTP_200_OK)

# Usuwanie ubrania - DELETE /api/clothes/<id>/
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_cloth(request, pk):
    try:
        cloth = Cloth.objects.get(pk=pk, user=request.user)
        cloth.delete()
        return Response({'message': 'Ubranie zostało pomyślnie usunięte z szafy.'}, status=status.HTTP_204_NO_CONTENT)
    except Cloth.DoesNotExist:
        return Response({'error': 'Ubranie nie istnieje lub nie masz do niego dostępu.'}, status=status.HTTP_404_NOT_FOUND)


# Aktualizacja ubrania (np. zmiana kategorii, kolorystyki, opisu) - PUT /api/clothes/<id>/
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_cloth(request, pk):
    try:
        cloth = Cloth.objects.get(pk=pk, user=request.user)
    except Cloth.DoesNotExist:
        return Response({'error': 'Ubranie nie istnieje lub nie masz do niego dostępu.'}, status=status.HTTP_404_NOT_FOUND)

    cloth.color = request.data.get('color', cloth.color)
    cloth.description = request.data.get('description', cloth.description)
    
    if 'image' in request.FILES:
        cloth.image = request.FILES.get('image')
        
    cloth.save()

    categories_list = request.data.getlist('categories')
    if categories_list:
        cloth.category_set.clear()
        for cat_name in categories_list:
            category_obj, _ = Category.objects.get_or_create(name=cat_name)
            category_obj.clothes.add(cloth)

    return Response({'message': 'Ubranie zaktualizowane pomyślnie!', 'id': cloth.id}, status=status.HTTP_200_OK)


# Dodatkowy endpoint do ręcznego dodawania ubrania bez użycia AI (np. gdy AI nie dało rady przeanalizować zdjęcia lub użytkownik chce dodać ubranie bez zdjęcia)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def manual_upload_cloth(request):
    image = request.FILES.get('image')
    if not image:
        return Response({'error': 'Zdjęcie jest wymagane.'}, status=status.HTTP_400_BAD_REQUEST)

    color = request.data.get('color', 'Nieznany')
    description = request.data.get('description', '')

    cloth = Cloth.objects.create(
        user=request.user,
        color=color,
        description=description,
        image=image
    )

    categories_list = request.data.getlist('categories')
    for cat_name in categories_list:
        category_obj, _ = Category.objects.get_or_create(name=cat_name)
        category_obj.clothes.add(cloth)

    return Response({
        'message': 'Ubranie dodane ręcznie bez użycia AI!',
        'id': cloth.id
    }, status=status.HTTP_201_CREATED)

# Pobieranie wszystkich kompozycji użytkownika - GET /api/compositions/
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_compositions(request):
    compositions = Composition.objects.filter(user=request.user)
    data = []
    for comp in compositions:
        data.append({
            'id': comp.id,
            'occasion': comp.target_event,
            'date': comp.created_at, # o ile masz takie pole w modelu
            'clothes': list(comp.clothes.values('id', 'color', 'description'))
        })
    return Response(data)