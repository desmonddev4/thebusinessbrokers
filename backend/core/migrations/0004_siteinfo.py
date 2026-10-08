# Generated migration for SiteInfo model

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0003_site_content_and_settings'),
    ]

    operations = [
        migrations.CreateModel(
            name='SiteInfo',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(default='Top Business Brokers Consult Limited', max_length=200)),
                ('registration', models.CharField(default='CS054812019', max_length=50)),
                ('incorporated', models.CharField(default='19 March 2007', max_length=100)),
                ('company_type', models.CharField(default='Private limited company', max_length=100)),
                ('address', models.TextField(default='Near Liberation Christian Centre, Bomso, Kumasi, Ashanti Region, Ghana')),
                ('post', models.CharField(default='P. O. Box UP 629, KNUST, Kumasi', max_length=200)),
                ('phones', models.JSONField(blank=True, default=list)),
                ('tin', models.CharField(default='C0022801235', max_length=50)),
                ('auditors', models.CharField(default='Bridgewater Consulting, Kumasi', max_length=200)),
                ('email', models.EmailField(blank=True, default='')),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'site information',
                'verbose_name_plural': 'site information',
            },
        ),
    ]
