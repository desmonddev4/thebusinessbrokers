from django.core.management.base import BaseCommand
from core.models import SiteContent


class Command(BaseCommand):
    help = "Seed SiteContent with static content from the website. Safe to re-run."

    def handle(self, *args, **options):
        # Content from content.js
        content_data = {
            # Hero section
            "home.hero.heading": "Someone is looking for what you are holding.",
            "home.hero.subheading": "We find them, check that they are real, establish what the thing is worth, and hold the deal together until it closes. Twenty five specialist desks, one broker accountable to you.",

            # About page
            "about.vision": "To be West Africa's most trusted brokerage house, recognised for transactions that close cleanly, counsel that is candid, and a standard of professional conduct that raises the market around us.",
            "about.mission": "To broker transactions across finance, property, commodities, services and specialist assets with rigour, transparency and undivided loyalty to the client who appoints us.",

            # Values (stored as JSON array)
            "about.values": '[["Undivided loyalty","We act for the party who appoints us. Where a conflict exists or could reasonably be perceived, we disclose it before accepting the mandate, and we withdraw where disclosure is not enough. We do not collect undisclosed commissions from both sides of a transaction."],["Verified before recommended","We do not market what we have not examined. Title is searched, condition inspected, credentials checked and numbers tested before an opportunity reaches a client. Where we cannot verify something, we say so."],["Candour over comfort","Clients receive our honest assessment even when it costs us the mandate. A broker who tells a seller their asking price is unrealistic loses one instruction and keeps a client."],["Confidentiality as standard","Much of what we handle is commercially sensitive and some of it is personal. Information disclosed to us stays with us, and is shared only with parties the client has approved."],["Completion, not introduction","Our work is not finished when two parties meet. We stay with a transaction through diligence, negotiation, documentation and completion, and we remain available afterwards when questions arise."]]',

            # Standards
            "about.standards": '["We act for one principal in a transaction, and disclose in writing any interest we hold in the counterparty, the asset or the outcome.", "Our fee is agreed with you before work starts. We take no undisclosed payment from anyone else in the deal.", "We run know your customer and anti money laundering checks on every counterparty, and decline mandates where the ownership chain cannot be established.", "We do not market an asset whose title or authority to sell we have not verified, and we put the limits of our verification in writing.", "What you tell us stays with us, indefinitely, unless you instruct otherwise or the law requires disclosure."]',

            # How we work - conditions
            "how.conditions": '[["Opportunity is properly sourced","The deal comes from a verified instruction, not a rumour. We establish who holds the asset and what authority they have to deal with it before anything reaches the market."],["Facts are established independently","Title is searched, condition inspected, accounts reviewed, licences confirmed. Where specialist judgement is needed we appoint an independent professional rather than take the seller\\'s word."],["Value is set on evidence","Price comes from comparable evidence, income analysis, replacement cost or discounted cash flow. A broker who accepts the asking price without testing it is relaying, not advising."],["Structure and compliance protect the deal","Terms allocate risk sensibly and the regulatory, tax and statutory work happens before completion. Know your customer and anti money laundering checks apply to every counterparty."],["The relationship outlives the transaction","Handover is complete, documents are delivered, and you know who to call two years later."]]',

            # How we work - stages
            "how.stages": '[["Mandate and scoping","We agree your objective, confirm authority to instruct, and set the scope and fee in writing.","A signed engagement letter"],["Origination and verification","We find and screen the other side, then verify title, condition, accounts and licences ourselves.","A verification report saying what was confirmed and what was not"],["Valuation and structuring","We establish defensible value and design a structure that meets regulatory requirements.","A valuation basis and recommended structure"],["Negotiation and documentation","We negotiate for you, coordinate legal drafting and diligence, and manage conditions to signature.","Negotiated terms and a managed completion timetable"],["Completion and aftercare","We manage settlement, transfer and handover, then stay reachable.","A closed transaction and the complete document file"]]',
        }

        created = 0
        updated = 0

        for key, value in content_data.items():
            section, key_name = key.split(".", 1)

            # Determine value type
            if key in ["about.values", "about.standards", "how.conditions", "how.stages"]:
                value_type = "json"
            else:
                value_type = "text"

            obj, created_flag = SiteContent.objects.update_or_create(
                section=section,
                key=key_name,
                defaults={
                    "value": value,
                    "value_type": value_type
                }
            )

            if created_flag:
                created += 1
            else:
                updated += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Content seeded: {created} created, {updated} updated."
            )
        )
