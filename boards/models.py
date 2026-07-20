from django.db import models

class User(models.Model):
    username = models.CharField(max_length=50)
    name = models.CharField(max_length=50)
    password = models.CharField(max_length=50)
    email = models.CharField(max_length=50)
    phone = models.IntegerField(unique=True)
    joined_date = models.DateField()

class Board(models.Model):
    name = models.CharField(max_length=100)
    created_date = models.DateField()
    
    # a user can have more projects (each project has a board so they become unanimous) and each project can have more users
    users = models.ManyToManyField(User, verbose_name="list of users working on the project") 

class Column(models.Model): # things like: to do, done, bugs etc.
    name = models.CharField(max_length=50)
    key = models.CharField(max_length=5)
    position = models.IntegerField()

    board = models.ForeignKey(Board, on_delete=models.PROTECT, unique=True) # should not be able to delete boards if it has columns 

class Task(models.Model):
    description = models.CharField(max_length=600)
    created_date = models.DateField()
    deadline = models.DateField()
    number = models.IntegerField()
    position = models.FloatField()

    board = models.ForeignKey(Board, on_delete=models.PROTECT) # FK needed to not take columns/ statuses from any project, ony from current board
    status = models.ForeignKey(Column, on_delete=models.PROTECT) # error when deleting column with tasks inside 
    main_task = models.ForeignKey("self", on_delete=models.CASCADE, null=True, blank=True, related_name="subtasks") # for subtask integration = adjacency list!!!

    def validate_main_task(self): # keep only one level which is task-> subtask (no task->subtask->subtask->......)
        if self.main_task and self.main_task.main_task:
            raise ValueError("Cannot give subtasks to another subtask")
