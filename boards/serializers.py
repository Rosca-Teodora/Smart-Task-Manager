# lifesaver: https://www.django-rest-framework.org/api-guide/serializers/#modelserializer
from rest_framework import serializers
from .models import Board, UserBoard, Column, Task, AssignedTask

class TaskSerializer(serializers.ModelSerializer):
    class Meta: 
        model = Task
        fields = '__all__'
        depth = 2

class AssignedTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssignedTask
        fields = '__all__'
    
class UserBoardSerializer(serializers.ModelSerializer):
    class Meta: 
        model = UserBoard
        fields = '__all__'

class ColumnSerializer(serializers.ModelSerializer):
    class Meta: 
        model = Column
        fields = '__all__'
        depth = 1

class BoardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Board 
        fields = '__all__'
