from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError

class Board(models.Model):
    name = models.CharField(max_length=100)
    created_date = models.DateTimeField()

class User_Board(models.Model):
    role = models.CharField(max_length=30)
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL)
    board = models.ForeignKey(Board)
    

class Column(models.Model): # things like: to do, done, bugs etc.
    name = models.CharField(max_length=50)
    key = models.CharField(max_length=5)
    position = models.IntegerField()

    board = models.ForeignKey(Board, on_delete=models.CASCADE) # deleting boards deletes evertything
    
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["board", "key"], name="unique_column_key_for_board")
        ]

class Task(models.Model):
    title = models.CharField(max_length=30)
    description = models.CharField(max_length=600)
    created_date = models.DateTimeField()
    last_edited_date = models.DateTimeField()
    deadline = models.DateTimeField()
    number = models.IntegerField()
    position = models.FloatField()

    board = models.ForeignKey(Board, on_delete=models.CASCADE) # FK needed to not take columns/ statuses from any project, ony from current board
    status = models.ForeignKey(Column, on_delete=models.PROTECT) # error when deleting column with tasks inside 
    main_task = models.ForeignKey("self", on_delete=models.CASCADE, null=True, blank=True, related_name="subtasks") # for subtask integration = adjacency list!!!

    def clean(self): # keep only one level which is task-> subtask (no task->subtask->subtask->......)
        if self.main_task and self.main_task.main_task:
            raise ValidationError("Cannot give subtasks to another subtask")
        
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["board", "number"], name="unique_task_number_for_board")
        ]

