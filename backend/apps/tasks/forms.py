from django import forms

from .models import Task


class TaskForm(forms.ModelForm):
    progress = forms.IntegerField(
        min_value=0,
        max_value=100,
        required=False,
        initial=0,
        widget=forms.NumberInput(attrs={'min': 0, 'max': 100}),
    )

    class Meta:
        model = Task
        fields = ['title', 'description', 'due_date', 'status', 'priority', 'progress']
        widgets = {
            'due_date': forms.DateInput(attrs={'type': 'date'}),
            'description': forms.Textarea(attrs={'rows': 3}),
        }

    def clean_progress(self):
        return self.cleaned_data.get('progress') or 0

    def clean(self):
        cleaned_data = super().clean()
        if cleaned_data.get('status') == 'done':
            cleaned_data['progress'] = 100
        if self.instance and self.instance.pk and self.instance.status == 'done':
            if 'title' in self.changed_data:
                self.add_error('title', 'Cannot modify title of a completed task.')
            if 'description' in self.changed_data:
                self.add_error('description', 'Cannot modify description of a completed task.')
        return cleaned_data
