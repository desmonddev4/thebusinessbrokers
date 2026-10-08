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
            "how.conditions": r'[["Opportunity is properly sourced","The deal comes from a verified instruction, not a rumour. We establish who holds the asset and what authority they have to deal with it before anything reaches the market."],["Facts are established independently","Title is searched, condition inspected, accounts reviewed, licences confirmed. Where specialist judgement is needed we appoint an independent professional rather than take the seller\'s word."],["Value is set on evidence","Price comes from comparable evidence, income analysis, replacement cost or discounted cash flow. A broker who accepts the asking price without testing it is relaying, not advising."],["Structure and compliance protect the deal","Terms allocate risk sensibly and the regulatory, tax and statutory work happens before completion. Know your customer and anti money laundering checks apply to every counterparty."],["The relationship outlives the transaction","Handover is complete, documents are delivered, and you know who to call two years later."]]',

            # How we work - stages
            "how.stages": '[["Mandate and scoping","We agree your objective, confirm authority to instruct, and set the scope and fee in writing.","A signed engagement letter"],["Origination and verification","We find and screen the other side, then verify title, condition, accounts and licences ourselves.","A verification report saying what was confirmed and what was not"],["Valuation and structuring","We establish defensible value and design a structure that meets regulatory requirements.","A valuation basis and recommended structure"],["Negotiation and documentation","We negotiate for you, coordinate legal drafting and diligence, and manage conditions to signature.","Negotiated terms and a managed completion timetable"],["Completion and aftercare","We manage settlement, transfer and handover, then stay reachable.","A closed transaction and the complete document file"]]',

            # Network page
            "network.lede": "Brokerage is a judgement business. Systems and standards matter, but a client is finally relying on the person who assessed the opportunity and told them what it was worth. Twenty two lead advisers hold our practice areas, each answerable for the technical assessment behind mandates in their field.",
            "network.associates_lede": "Beyond the bench, we keep standing relationships with independent professionals engaged mandate by mandate. This keeps our overheads sensible and means specialist judgement is available whenever a transaction needs it.",
            "network.associates": '["Valuation surveyors and estate surveyors","Legal practitioners and conveyancers","Chartered accountants and auditors","Quantity surveyors and civil engineers","Insurance underwriters and loss adjusters","Mining and geological consultants","Agricultural and agribusiness specialists","Carbon and environmental assessors","ICT and intellectual property specialists","Hospitality and tourism operators"]',
            "network.associates_cta": "If you practise in one of these fields and want to be considered for our associate panel, write to us through the contact section below and say which disciplines you cover.",

            # Initiatives page
            "initiatives.lede": "A market without a standard is a market where the careful firm and the careless one look identical to a client. We are building the two things that would change that, and we are paying for them because waiting for someone else to has not worked.",
            "initiatives.institute.name": "Africa Brokerage Institute",
            "initiatives.institute.strap": "A professional body for brokers, agents and transaction intermediaries across African markets",
            "initiatives.institute.paras": '["A broker in Kumasi with a buyer in Lagos currently has no reliable way to find a counterpart there, no way to check that counterpart is competent, and no shared standard to transact under. Nothing distinguishes a firm that verifies title from one that does not, until the transaction fails. The Institute exists to fix that.","The Institute is a membership body, owned by Top Business Brokers and governed on standards by an independent council drawn from its members. That separation matters: a standard written by one firm for its own convenience would not be worth signing, and the Institute is only useful if brokers who compete with us are willing to join it."]',
            "initiatives.institute.offers": '[["A published conduct standard","One page, signed by every member: act for one principal, disclose your fee, verify before you market, run client due diligence, and say what you could not confirm. Members who breach it are removed and the register shows it."],["Membership grades and post-nominals","Graded admission against evidence of practice and competence, carrying designatory letters a member can put on a business card and a client can check."],["A public member register","Searchable by country, asset class, faculty and grade, so a client or a fellow broker can confirm in seconds whether someone is a member in good standing."],["Cross border referral","A structured route for passing a mandate to a member in another market, with agreed referral terms so the arrangement does not have to be negotiated from scratch each time."],["A shared verification protocol","Common templates for title checks, client due diligence and counterparty screening, so verification quality does not depend on who happens to be handling the file."],["Discipline faculties","Specialist faculties inside the Institute, each with technical standards for its own discipline sitting beneath the conduct standard."],["Continuing professional development","Working sessions, technical notes and an annual programme culminating in the Summit."],["Complaints and discipline","A route for a client to complain about a member, investigated by the council rather than by the firm, with removal from the register as the sanction."]]',
            "initiatives.institute.grades": '[["Fellow","FABI","Senior practitioners with a substantial completed transaction record, admitted on sponsorship and review"],["Member","MABI","Practising brokers, agents and intermediaries meeting the competence and conduct requirements"],["Associate","AABI","Valuers, lawyers, auditors, underwriters and technical specialists who serve member mandates"],["Graduate","GABI","Entrants in their first two years of practice, with mentoring and a reduced subscription"],["Corporate practice","","Brokerage firms and agencies undertaking firm wide adherence, with all practising staff listed"],["Institutional affiliate","","Banks, funds, assemblies, agencies and regulators, holding observer standing in standards consultation"]]',
            "initiatives.institute.faculties": '[["Business Brokerage","First to be constituted","Business sales, mergers, acquisitions and succession. Valuation methodology, confidentiality protocol, buyer screening and an anonymised transaction record."],["Insurance and Risk","Planned","Risk placement, cover design and claims advocacy conducted for the client rather than the underwriter."],["Property and Land","Planned","Title verification, customary land process, valuation basis and agency conduct."],["Freight and Trade","Planned","Carrier selection, rate transparency, customs documentation and cargo liability."],["Capital and Investment","Planned","Information memoranda, investor screening, disclosure and fee transparency in fund raising."]]',
            "initiatives.institute.status": "The Institute is in formation. Founding membership will open ahead of the first Summit, and founding members will sit on the council that finalises the conduct standard rather than merely receiving it.",
            "initiatives.institute.faculties_intro": "The Business Brokerage Faculty comes first because it is the discipline the firm knows best, which means the faculty model can be tested where a mistake is cheapest to correct. Further faculties are constituted as membership in that discipline justifies them, not on a timetable.",
            "initiatives.summit.name": "Africa Brokerage Summit",
            "initiatives.summit.strap": "The continental meeting for brokers, agents and intermediaries across every asset class",
            "initiatives.summit.intro": "Brokerage across Africa operates largely without a professional forum. The same avoidable failures cost the market money every year, and nobody convenes the people who could fix them. Top Business Brokers is organising the summit we think the market is missing.",
            "initiatives.summit.body": "The Summit brings together brokers, agents, valuers, lawyers, underwriters, lenders, regulators and the institutional clients who instruct them. The purpose is practical rather than ceremonial: to work through the failures that actually cost this market money, and to adopt a conduct standard clients can hold any intermediary to. It is the annual general meeting of the Africa Brokerage Institute, and each faculty runs its own programme within it.",
            "initiatives.summit.who": "Practising brokers and agents across property, insurance, commodities, freight, energy and business sales. Bank and fund officers who finance transactions. Valuers, surveyors, lawyers and auditors who verify them. Assembly, agency and regulatory officers who procure through them. Business owners weighing a sale or a raise.",
            "initiatives.summit.themes": '["Title, land documentation and why transactions litigate","Pricing what has no comparable: valuation in thin markets","Carbon credits after the credibility reckoning","Financing the deal: what lenders actually need to see","Conduct, disclosure and the case for a continental brokerage standard","Cross border referral and the African Continental Free Trade Area","Diaspora capital and the representation problem"]',
            "initiatives.summit.facts": '[["Owned and convened by","Top Business Brokers Consult Limited"],["Standing as","Annual general meeting of the Africa Brokerage Institute"],["First edition","Kumasi, Ghana"],["Date","To be announced"],["Venue","To be announced"],["Format","Working sessions rather than keynotes"],["Standing items","Adoption and review of the conduct standard, admission of Fellows, and constitution of faculties"],["Registering interest","Write to us through the contact form and choose Not sure yet as the desk. We will send details once dates are fixed."]]',
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
