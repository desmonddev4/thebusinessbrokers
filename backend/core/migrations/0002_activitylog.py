# Generated manually for ActivityLog model

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='ActivityLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('action', models.CharField(choices=[('create', 'Create'), ('update', 'Update'), ('delete', 'Delete'), ('view', 'View')], max_length=10)),
                ('content_type', models.CharField(choices=[('desk', 'Desk'), ('person', 'Person'), ('enquiry', 'Enquiry')], max_length=10)),
                ('object_id', models.PositiveIntegerField(blank=True, null=True)),
                ('object_name', models.CharField(blank=True, max_length=200)),
                ('description', models.TextField(blank=True)),
                ('user', models.CharField(blank=True, max_length=150)),
            ],
            options={
                'verbose_name': 'activity log',
                'verbose_name_plural': 'activity logs',
                'ordering': ['-timestamp'],
            },
        ),
    ]
