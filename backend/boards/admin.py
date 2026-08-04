from django.contrib import admin
from .models import Board, UserBoard, Column, Task, AssignedTask, Comment

@admin.register(Board)
class BoardAdmin(admin.ModelAdmin):
    list_display = ["key", "name", "created_date"] # what appears in the admin list view


@admin.register(UserBoard)
class UserBoardAdmin(admin.ModelAdmin):
    list_display = ["user", "board", "role"]


@admin.register(Column)
class ColumnAdmin(admin.ModelAdmin):
    list_display = ["name", "board", "position"]
    list_filter = ["board"]


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ["__str__", "board", "status", "position", "deadline"]
    list_filter = ["board", "status"]


@admin.register(AssignedTask)
class AssignedTaskAdmin(admin.ModelAdmin):
    list_display = ["task", "user"]

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ["user", "text", "created_date", "last_edited_date"]