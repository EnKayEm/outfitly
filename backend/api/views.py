from django.shortcuts import render
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes
from database.models import Cloth, Category, OutfitlyUser, Composition
from .ai_service import analyze_cloth_image
from .ai_service import generate_stylization

# Endpoint do wylogowania użytkownika - POST /api/logout/
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    try:
        refresh_token = request.data.get("refresh")
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({"message": "Wylogowano pomyślnie."}, status=status.HTTP_205_RESET_CONTENT)
    except Exception:
        return Response({"error": "Błędny token lub już wygasł."}, status=status.HTTP_400_BAD_REQUEST)

# Endpoint do przesyłania zdjęcia ubrania i otrzymywania analizy AI - POST /api/clothes/upload/
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_and_analyze_cloth(request):
    if 'image' not in request.FILES:
        return Response({'error': 'Brak zdjęcia w zapytaniu.'}, status=status.HTTP_400_BAD_REQUEST)

    image_file = request.FILES['image']
    user = request.user

    cloth = Cloth.objects.create(user=user, image=image_file)
    ai_data = analyze_cloth_image(cloth.image.path)

    if ai_data.get('error') == 'not_clothing':
        cloth.delete()
        return Response({'error': 'To nie wygląda na ubranie. Prześlij inne zdjęcie.'}, status=status.HTTP_400_BAD_REQUEST)

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
        'temp_id': cloth.id,
        'image_url': request.build_absolute_uri(cloth.image.url),
        'ai_proposal': {
            'color': cloth.color,
            'description': cloth.description,
            'categories': categories
        },
        'message': 'AI przeanalizowało ubranie. Możesz teraz potwierdzić lub edytować dane.'
    }, status=status.HTTP_200_OK)

# Endpoint do potwierdzania lub edytowania danych ubrania po analizie AI - POST /api/clothes/upload/confirm/
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def finalize_upload(request):
    cloth_id = request.data.get('temp_id')
    color = request.data.get('color')
    description = request.data.get('description')
    categories_list = request.data.get('categories', [])

    try:
        cloth = Cloth.objects.get(id=cloth_id, user=request.user)
        
        cloth.color = color
        cloth.description = description
        cloth.save()

        cloth.category_set.clear()
        for cat_name in categories_list:
            category_obj, _ = Category.objects.get_or_create(name=cat_name)
            category_obj.clothes.add(cloth)

        return Response({'message': 'Ubranie dodane pomyślnie!', 'id': cloth.id}, status=status.HTTP_201_CREATED)
    except Cloth.DoesNotExist:
        return Response({'error': 'Nie znaleziono ubrania.'}, status=status.HTTP_404_NOT_FOUND)

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

    return Response({
        'occasion': occasion,
        'suggested_outfit_ids': ai_data['outfit_ids'],
        'justification': ai_data.get('justification', ''),
        'message': 'Oto propozycja AI. Czy chcesz ją zapisać w swojej kolekcji?'
    }, status=status.HTTP_200_OK)

# Endpoint do potwierdzania i zapisywania zaproponowanej stylizacji - POST /api/clothes/suggest/confirm/
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirm_outfit(request):
    outfit_ids = request.data.get('outfit_ids')
    occasion = request.data.get('occasion', 'Stylizacja')

    if not outfit_ids:
        return Response({'error': 'Brak ID ubrań do zapisania.'}, status=status.HTTP_400_BAD_REQUEST)

    composition = Composition.objects.create(
        user=request.user,
        target_event=occasion
    )
    composition.clothes.set(outfit_ids)

    return Response({
        'id': composition.id,
        'message': 'Stylizacja została pomyślnie zapisana!'
    }, status=status.HTTP_201_CREATED)

# Pobieranie wszystkich ubrań użytkownika - GET /api/clothes/
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_clothes(request):
    sort_by = request.GET.get('sort_by', '-creation_date')

    allowed_sort_fields = [
        'creation_date', '-creation_date',  # Od najstarszych / od najnowszych
        'color', '-color',                  # Alfabetycznie po kolorze (A-Z / Z-A)
    ]

    if sort_by not in allowed_sort_fields:
        sort_by = '-creation_date'

    clothes = Cloth.objects.filter(user=request.user).order_by(sort_by).distinct()
    
    data = []
    for cloth in clothes:
        data.append({
            'id': cloth.id,
            'color': cloth.color,
            'description': cloth.description,
            'image_url': request.build_absolute_uri(cloth.image.url) if cloth.image else None,
            'categories': list(cloth.category_set.values_list('name', flat=True)),
            'creation_date': cloth.creation_date
        })
        
    return Response(data, status=status.HTTP_200_OK)

# Pobieranie szczegółów lub usuwanie konkretnego ubrania - GET /api/clothes/<id>/
@api_view(['GET', 'DELETE'])
@permission_classes([IsAuthenticated])
def cloth_detail_or_delete(request, pk):
    try:
        cloth = Cloth.objects.get(pk=pk, user=request.user)
    except Cloth.DoesNotExist:
        return Response({'error': 'Nie znaleziono ubrania.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response({
            'id': cloth.id,
            'color': cloth.color,
            'description': cloth.description,
            'image_url': request.build_absolute_uri(cloth.image.url) if cloth.image else None,
            'categories': list(cloth.category_set.values_list('name', flat=True)),
            'creation_date': cloth.creation_date
        })

    elif request.method == 'DELETE':
        cloth.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


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
    compositions = Composition.objects.filter(user=request.user).prefetch_related('clothes').order_by('-id')
    
    data = []
    for comp in compositions:
        clothes_list = []
        for cloth in comp.clothes.all():
            clothes_list.append({
                'id': cloth.id,
                'color': cloth.color,
                'description': cloth.description,
                'image_url': request.build_absolute_uri(cloth.image.url) if cloth.image else None
            })
            
        data.append({
            'id': comp.id,
            'occasion': comp.target_event,
            'created_at': comp.created_at if hasattr(comp, 'created_at') else "Brak daty",
            'clothes': clothes_list
        })
        
    return Response(data, status=status.HTTP_200_OK)