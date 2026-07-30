# lifesaver: https://www.django-rest-framework.org/api-guide/serializers/#modelserializer
from rest_framework import serializers
from .models import Board, UserBoard, Column, Task, AssignedTask
from django.contrib.auth import get_user_model

class TaskSerializer(serializers.ModelSerializer):
    key = serializers.SerializerMethodField()
    
    class Meta: 
        model = Task
        fields = '__all__'
        read_only_fields = ["id", "number", "created_date", "last_edited_date"]
    
    def get_key(self, obj):
        return f"{obj.board.key}-{obj.number}"
    

class ColumnSerializer(serializers.ModelSerializer):
    tasks = TaskSerializer(many=True, read_only=True)
    
    class Meta: 
        model = Column
        fields = '__all__'
        read_only_fields = ["id"]
    

class AssignedTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssignedTask
        fields = '__all__'
    
class UserBoardSerializer(serializers.ModelSerializer):
    class Meta: 
        model = UserBoard
        fields = '__all__'

class BoardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Board 
        fields = '__all__'

class CreateUserSerializer(serializers.ModelSerializer):
    class Meta: 
        model = get_user_model()
        fields = ['username', 'password']
        extra_kwargs = {'password': {'write_only': True}}
    
    def create(self, valid_data):
        user = get_user_model()(username = valid_data['username'])
        user.set_password(valid_data['password'])
        user.save()
        return user
