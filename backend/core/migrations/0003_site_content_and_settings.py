# Generated manually for SiteContent and SiteSettings models

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0002_activitylog'),
    ]

    operations = [
        migrations.CreateModel(
            name='SiteContent',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('section', models.CharField(max_length=100)),
                ('key', models.CharField(max_length=100)),
                ('value', models.TextField(blank=True)),
                ('value_type', models.CharField(choices=[('text', 'Text'), ('html', 'HTML'), ('json', 'JSON'), ('number', 'Number')], default='text', max_length=20)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'site content',
                'verbose_name_plural': 'site content',
                'ordering': ['section', 'key'],
            },
        ),
        migrations.AlterUniqueTogether(
            name='sitecontent',
            unique_together={('section', 'key')},
        ),
        migrations.CreateModel(
            name='SiteSettings',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('key', models.CharField(max_length=100, unique=True)),
                ('value', models.TextField(blank=True)),
                ('value_type', models.CharField(choices=[('text', 'Text'), ('email', 'Email'), ('url', 'URL'), ('number', 'Number'), ('boolean', 'Boolean'), ('json', 'JSON')], default='text', max_length=20)),
                ('description', models.TextField(blank=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'site setting',
                'verbose_name_plural': 'site settings',
                'ordering': ['key'],
            },
        ),
    ]
