
from django.contrib.auth.models import BaseUserManager


class OutfitlyUserManager(BaseUserManager):

    # Note: if you do not provide password, you will not be able to log in, all password
    #       checks will fail. It may be intended or not, there are some use cases though ...
    def create_user(self, login, email, password=None, **extra_fields):
        if not login: raise ValueError('Login must be set you loober!')
        if not email: raise ValueError('Email must be set you emober!')
        email   = self.normalize_email(email)
        user    = self.model(login=login, email=email, **extra_fields)
        user.set_password(password)
        user.save()
        return user
        
    def create_superuser(self, login, email, password=None, **extra_fields):
        
        extra_fields.setdefault("is_staff",     True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active",    True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True")

        return self.create_user(login, email, password, **extra_fields)

