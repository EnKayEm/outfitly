
from database.models    import OutfitlyUser, Category, Cloth, Composition
from django.contrib     import admin


@admin.register(OutfitlyUser)
class OutfitlyUserAdmin(admin.ModelAdmin):
    list_display        = ('id', 'login', 'email', 'creation_date', 'is_staff')


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display        = ('id', 'name', 'description')


@admin.register(Cloth)
class ClothAdmin(admin.ModelAdmin):
    list_display        = ('id', 'user', 'color', 'description', 'creation_date')


@admin.register(Composition)
class CompositionAdmin(admin.ModelAdmin):
    list_display        = ('id', 'user', 'is_favourite', 'target_event')

