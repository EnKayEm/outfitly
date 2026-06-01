from django.shortcuts import render
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes
from rest_framework.views import APIView
from database.models import Cloth, Category, OutfitlyUser, Composition
from .ai_service import analyze_cloth_image
from .ai_service import generate_stylization
import requests
from django.core.files.temp import NamedTemporaryFile

User = get_user_model()

# Endpoint do rejestracji użytkownika - POST /api/auth/register/
class RegisterView(APIView):
    def post(self, request):
        login = request.data.get('login')
        email = request.data.get('email')
        password = request.data.get('password')

        if not login or not email or not password:
            return Response({"error": "Musisz podać login, email i hasło!"}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(login=login).exists():
            return Response({"login": "Nazwa użytkownika już istnieje"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.create_user(
                login=login,
                email=email,
                password=password
            )
            return Response({"message": "Użytkownik zarejestrowany!"}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

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

# Endpoint do pobrania danych zalogowanego użytkownika - GET /api/auth/me/
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    return Response({
        'login': request.user.login,
        'email': request.user.email,
    }, status=status.HTTP_200_OK)

# Endpoint do przesyłania zdjęcia ubrania i otrzymywania analizy AI - POST /api/clothes/upload/
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_and_analyze_cloth(request):
    if 'image' not in request.FILES:
        return Response({'error': 'Brak zdjęcia w zapytaniu.'}, status=status.HTTP_400_BAD_REQUEST)

    image_file = request.FILES['image']
    user = request.user

    cloth = Cloth.objects.create(user=user, image=image_file)
    response = requests.get(cloth.image.url)
    
    with NamedTemporaryFile(delete=True) as tmp_file:
        tmp_file.write(response.content)
        tmp_file.flush()

        ai_data = analyze_cloth_image(tmp_file.name)

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

    clothes = Cloth.objects.filter(user=request.user).prefetch_related('category_set').order_by(sort_by).distinct()
    
    data = []
    for cloth in clothes:
        data.append({
            'id': cloth.id,
            'color': cloth.color,
            'description': cloth.description,
            'image_url': request.build_absolute_uri(cloth.image.url) if cloth.image else None,
            'categories': list(cloth.category_set.values_list('name', flat=True)),
            'creation_date': cloth.creation_date,
            'is_favourite': cloth.is_favourite,
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
    compositions = Composition.objects.filter(user=request.user).prefetch_related('clothes').order_by('-creation_date')
    
    data = []
    for comp in compositions:
        clothes_list = []
        for cloth in comp.clothes.all():
            clothes_list.append({
                'id': cloth.id,
                'color': cloth.color,
                'description': cloth.description,
                'image_url': request.build_absolute_uri(cloth.image.url) if cloth.image else None,
                'is_favourite': cloth.is_favourite,
            })
            
        data.append({
            'id': comp.id,
            'occasion': comp.target_event,
            'creation_date': comp.creation_date,
            'is_favourite': comp.is_favourite,
            'clothes': clothes_list
        })
        
    return Response(data, status=status.HTTP_200_OK)

#endpoint do dodania stylizacji do ulubionych
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def toggle_composition_favourite(request, pk):
    try:
        composition = Composition.objects.get(pk=pk, user=request.user)
    except Composition.DoesNotExist:
        return Response({'error': 'Nie znaleziono stylizacji.'}, status=status.HTTP_404_NOT_FOUND)

    composition.is_favourite = not composition.is_favourite
    composition.save()

    return Response({
        'id': composition.id,
        'is_favourite': composition.is_favourite,
        'message': 'Zaktualizowano status ulubionych.'
    }, status=status.HTTP_200_OK)    

#endpoint do usuwania stylizacji z kolekcji
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_composition(request, pk):
    try:
        composition = Composition.objects.get(pk=pk, user=request.user)
    except Composition.DoesNotExist:
        return Response({'error': 'Nie znaleziono stylizacji.'}, status=status.HTTP_404_NOT_FOUND)

    composition.delete()
    return Response({'message': 'Stylizacja została usunięta.'}, status=status.HTTP_204_NO_CONTENT)

#endpoint do edycji stylizacji z kolekcji
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_composition(request, pk):
    try:
        composition = Composition.objects.get(pk=pk, user=request.user)
    except Composition.DoesNotExist:
        return Response({'error': 'Nie znaleziono stylizacji.'}, status=status.HTTP_404_NOT_FOUND)

    target_event = request.data.get('target_event')
    outfit_ids = request.data.get('outfit_ids')

    if target_event:
        composition.target_event = target_event

    if outfit_ids:
        clothes = Cloth.objects.filter(id__in=outfit_ids, user=request.user)
        composition.clothes.set(clothes)

    composition.save()

    return Response({
        'id': composition.id,
        'message': 'Stylizacja zaktualizowana pomyślnie!'
    }, status=status.HTTP_200_OK)


#endpoint dodanie do ulubionych
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def toggle_cloth_favourite(request, pk):
    try:
        cloth = Cloth.objects.get(pk=pk, user=request.user)
    except Cloth.DoesNotExist:
        return Response({'error': 'Nie znaleziono ubrania.'}, status=status.HTTP_404_NOT_FOUND)

    cloth.is_favourite = not cloth.is_favourite
    cloth.save()

    return Response({
        'id': cloth.id,
        'is_favourite': cloth.is_favourite,
        'message': 'Zaktualizowano status ulubionych.'
    }, status=status.HTTP_200_OK)
    
#endpoint do zmiany nazwy użytkownika
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def change_username(request):
    new_login = request.data.get('login')

    if not new_login:
        return Response({'error': 'Musisz podać nową nazwę użytkownika.'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(login=new_login).exists():
        return Response({'error': 'Ta nazwa użytkownika jest już zajęta.'}, status=status.HTTP_400_BAD_REQUEST)

    request.user.login = new_login
    request.user.save()

    return Response({
        'message': 'Nazwa użytkownika została zmieniona.',
        'login': request.user.login
    }, status=status.HTTP_200_OK)
    
#endpoint do zmiany adresu e-mail użytkownika
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def change_email(request):
    new_email = request.data.get('email')

    if not new_email:
        return Response({'error': 'Musisz podać nowy adres e-mail.'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(email=new_email).exists():
        return Response({'error': 'Ten adres e-mail jest już zajęty.'}, status=status.HTTP_400_BAD_REQUEST)

    request.user.email = new_email
    request.user.save()

    return Response({
        'message': 'Adres e-mail został zmieniony.',
        'email': request.user.email
    }, status=status.HTTP_200_OK)
    
#endpoint do zmiany hasła użytkownika
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def change_password(request):
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')

    if not old_password or not new_password:
        return Response({'error': 'Musisz podać stare i nowe hasło.'}, status=status.HTTP_400_BAD_REQUEST)

    if not request.user.check_password(old_password):
        return Response({'error': 'Stare hasło jest nieprawidłowe.'}, status=status.HTTP_400_BAD_REQUEST)

    request.user.set_password(new_password)
    request.user.save()

    return Response({
        'message': 'Hasło zostało zmienione pomyślnie.'
    }, status=status.HTTP_200_OK)