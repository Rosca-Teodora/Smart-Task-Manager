# lifesaver: https://www.django-rest-framework.org/api-guide/serializers/#modelserializer
from rest_framework import serializers
from .models import Board, UserBoard, Column, Task, AssignedTask, Comment
from django.contrib.auth import get_user_model

class TaskSerializer(serializers.ModelSerializer):
    key = serializers.SerializerMethodField()
    
    class Meta: 
        model = Task
        fields = '__all__'
        read_only_fields = ["id", "number", "created_date", "last_edited_date"]
        validators = []
    
    def get_key(self, obj):
        return f"{obj.board.key}-{obj.number}"
    

class ColumnSerializer(serializers.ModelSerializer):
    tasks = TaskSerializer(many=True, read_only=True, source="task_set")
    
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

class BoardMemberSerializer(serializers.ModelSerializer):
    username = serializers.CharField(read_only=True, source="user.username")

    class Meta:
        model = UserBoard
        fields = ["username", "role"]

class BoardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Board 
        fields = '__all__'

class BoardDetailSerializer(serializers.ModelSerializer):
    members = BoardMemberSerializer(many=True, read_only=True, source="userboard_set")
    columns = ColumnSerializer(many=True, read_only=True, source="column_set")
    
    class Meta:
        model = Board
        fields = ["id", "name", "key", "created_date", "members", "columns"]

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

class CommentSerializer(serializers.ModelSerializer):
    author = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Comment
        fields = ["id", "task", "text", "author", "created_date", "last_edited_date"]
        read_only_fields = ["id", "created_date", "last_edited_date"]

    def update(self, instance, validated_data):
        validated_data.pop("task", None)  # a comment cannot be moved to another task
        return super().update(instance, validated_data)


class TaskDetailSerializer(serializers.ModelSerializer):
    key = serializers.SerializerMethodField()
    comments = CommentSerializer(many=True, read_only=True, source="comment_set")

    class Meta: 
        model = Task
        fields = ["id", "key", "title", "description", "created_date",
                  "last_edited_date", "deadline", "number", "position",
                  "priority", "board", "status", "comments"]
        read_only_fields = ["id", "number", "created_date", "last_edited_date"]
        validators = []
    
    def get_key(self, obj):
        return f"{obj.board.key}-{obj.number}"