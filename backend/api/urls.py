from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/logout/', views.logout_user, name='logout'),

    path('clothes/upload/', views.upload_and_analyze_cloth, name='upload_cloth'),
    path('clothes/upload/confirm/', views.finalize_upload, name='finalize_upload'),

    path('clothes/suggest/', views.suggest_outfit, name='suggest_outfit'),
    path('clothes/suggest/confirm/', views.confirm_outfit, name='confirm_outfit'),

    path('clothes/', views.get_user_clothes, name='get_clothes'),
    path('clothes/<int:pk>/', views.cloth_detail_or_delete, name='cloth_detail_delete'),

    path('clothes/<int:pk>/update/', views.update_cloth, name='update_cloth'),
    path('clothes/manual/', views.manual_upload_cloth, name='manual_upload_cloth'),

    path('compositions/', views.get_user_compositions, name='get_compositions'),
]