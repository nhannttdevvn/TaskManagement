from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("tasks", "0006_set_default_passwords"),
    ]

    operations = [
        migrations.AddField(
            model_name="task",
            name="project",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="tasks",
                to="tasks.project",
            ),
        ),
        migrations.AddField(
            model_name="task",
            name="duration",
            field=models.FloatField(default=1.0),
        ),
        migrations.AddField(
            model_name="task",
            name="row",
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name="task",
            name="start",
            field=models.FloatField(default=9.0),
        ),
    ]
