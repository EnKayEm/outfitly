
"""
Database definition. The following tables (models) are defined:
- OutfitlyUser          - The application user
- Category              - Cloth category (e.g. dress, elegant, jacket, childish)
- ClothesCategorization - Mapping of `Cloth` to `Category` (implicit), that form a categorization 
- Cloth                 - A piece of cloth
- CompositionForming    - Mapping of `Composition` and `Cloth` (implicit), that specify which clothes belong to which compositions
- Composition           - Collection of clothes that form some style
"""

from django.contrib.auth.models import AbstractUser
from django.core.exceptions     import ValidationError
from django.db                  import models
from django.utils               import timezone

from database.managers          import OutfitlyUserManager


class OutfitlyUser(AbstractUser):

    login   = models.CharField(max_length=64, unique=True)
    email   = models.EmailField(unique=True)
    # password field is implicitly created by django ...
    
    # Is automatically set after a record creation
    creation_date   = models.DateTimeField(auto_now_add=True)

    # Replace default user manager with the outfitly one
    objects = OutfitlyUserManager()

    # Make django consider our login field as its username field, require email though
    username        = None
    USERNAME_FIELD  = "login"
    REQUIRED_FIELDS = ["email"]

    def __str__(self):
        return f"OutfitlyUser(login={self.login}, email={self.email}, creation_date={self.creation_date})"


class Category(models.Model):
    
    class Meta:
        verbose_name_plural = "Categories"
    
    name        = models.CharField(max_length=50, unique=True)
    description = models.CharField(max_length=512, blank=True)
    clothes     = models.ManyToManyField("Cloth")  # Implicit `ClothesOrganization` table

    def __str__(self):
        return f"Category(name={self.name}, description={self.description})"


class Cloth(models.Model):
    
    class Meta:
        verbose_name_plural = "Clothes"
    
    # So you can access all clothes of OutfitlyUser 'O' like: O.clothes.all()
    user        = models.ForeignKey(OutfitlyUser, on_delete=models.CASCADE, related_name="clothes")
        
    color       = models.CharField(max_length=32, blank=True)
    description = models.CharField(max_length=512, blank=True)
    
    # Is automatically set after a record creation
    creation_date   = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Cloth(user_id={self.user_id}, color={self.color}, description={self.description}, creation_date={self.creation_date})"


class Composition(models.Model):
    
    class Meta:
        verbose_name_plural = "Compositions"
    
    # So you can access all clothes of OutfitlyUser 'O' like: O.compositions.all()
    user            = models.ForeignKey(OutfitlyUser, on_delete=models.CASCADE, related_name="compositions")
    
    is_favourite    = models.BooleanField(default=False)
    target_event    = models.CharField(max_length=128)
    clothes         = models.ManyToManyField("Cloth")  # Implicit `CompositionForming` table
    
    def __str__(self):
        return f"Composition(user_id={self.user_id}, is_favourite={self.is_favourite}, target_event={self.target_event})"

