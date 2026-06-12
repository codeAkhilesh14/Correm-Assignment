import re
from typing import Tuple

# ---------------------------------------------------------------------------
# Extensive keyword mappings — each category uses compiled regex patterns.
# Category names match the assignment specification exactly.
# ---------------------------------------------------------------------------
CATEGORY_KEYWORDS = {
    "Salary": [
        r"\bsalary\b", r"\bsal\b", r"\bpayroll\b", r"\bpaycheck\b", r"\bwages\b",
        r"\bdir\s+dep\b", r"\bdirect\s+deposit\b", r"\bstipend\b", r"\ballowance\b",
        r"\breimbursement\b", r"\bbonus\b", r"\bepfo\b", r"\bprovident\s+fund\b",
        r"\bsalary\s+credit\b", r"\bmonthly\s+salary\b", r"\bnet\s+pay\b",
        r"\bhr\s+salary\b", r"\bsalary\s+transfer\b", r"\bpayment\s+salary\b",
        r"\bda\s+arrears\b", r"\bincentive\b", r"\bgratuity\b", r"\bpf\s+credit\b",
        r"\bneft\s+cr\s+sal\b", r"\bsalary\s+neft\b", r"\bsalary\s+imps\b",
        r"\bmonthly\s+wages\b", r"\bweekly\s+wages\b", r"\bcompensation\b",
        r"\bremuneration\b", r"\bpayslip\b", r"\bemployer\s+transfer\b",
    ],
    "EMI / Loan": [
        r"\bemi\b", r"\bloan\b", r"\bmortgage\b", r"\bhousing\s+loan\b",
        r"\bcar\s+loan\b", r"\bpersonal\s+loan\b", r"\beducation\s+loan\b",
        r"\bcredila\b", r"\bhdb\s+fs\b", r"\bhdb\s+financial\b", r"\bmuthoot\b",
        r"\bauto-debit\b", r"\bautodebit\b", r"\bbajaj\s+finance\b", r"\bbajaj\s+fin\b",
        r"\bchg\s+loan\b", r"\bnach\s+dr\b", r"\becs\s+dr\b", r"\becs\s+debit\b",
        r"\brepay\b", r"\brepayment\b", r"\binstallment\b", r"\bhome\s+loan\b",
        r"\bvehicle\s+loan\b", r"\btwo\s+wheeler\s+loan\b", r"\bcredit\s+card\s+due\b",
        r"\bcredit\s+card\s+payment\b", r"\bcc\s+payment\b", r"\bcibil\b",
        r"\bsbi\s+loan\b", r"\bhdfc\s+loan\b", r"\bicici\s+loan\b",
        r"\baxis\s+loan\b", r"\bkotak\s+loan\b", r"\bindusind\s+loan\b",
        r"\byes\s+bank\s+loan\b", r"\bpnb\s+loan\b", r"\bunion\s+bank\s+loan\b",
        r"\bfullerton\b", r"\btata\s+capital\b", r"\bhfc\b", r"\bnhb\b",
        r"\bemi\s+bounce\b", r"\bemi\s+debit\b", r"\bloan\s+emi\b",
        r"\bscheduled\s+repayment\b", r"\bdebt\s+repay\b", r"\bfinance\b",
        r"\bmanappuram\b", r"\bchola\b", r"\bshriram\s+finance\b",
    ],
    "Food & Dining": [
        r"\bswiggy\b", r"\bzomato\b", r"\brestaurant\b", r"\bdining\b", r"\bpizza\b",
        r"\bdomino\b", r"\bmcdonald\b", r"\bstarbucks\b", r"\bcafe\b", r"\bkfc\b",
        r"\bburger\b", r"\bbakery\b", r"\bcanteen\b", r"\bdeli\b", r"\bbistro\b",
        r"\btavern\b", r"\bbuffet\b", r"\bfood\b", r"\bbiryani\b", r"\bpizzahut\b",
        r"\bsubway\b", r"\bdunkin\b", r"\bccd\b", r"\bbarista\b", r"\bfresh\s+menu\b",
        r"\bfaasos\b", r"\bbox8\b", r"\bhunger\s+box\b", r"\brebel\s+foods\b",
        r"\bhaldiram\b", r"\bbarbeque\b", r"\bbbq\b", r"\bsushi\b", r"\bwok\b",
        r"\bdiner\b", r"\bgrills\b", r"\beach\b", r"\btaco\b", r"\bbig\s+basket\s+foods\b",
        r"\bfoodpanda\b", r"\beatfit\b", r"\bdahi\b", r"\bdosa\b", r"\bidli\b",
        r"\beach\s+&\s+drink\b", r"\bmeal\b", r"\blunch\b", r"\bdinner\b", r"\bbreakfast\b",
    ],
    "Travel": [
        r"\buber\b", r"\bola\b", r"\birctc\b", r"\bmakemytrip\b", r"\byatra\b",
        r"\bgoibibo\b", r"\bexpedia\b", r"\bflight\b", r"\brailway\b", r"\bairline\b",
        r"\bcab\b", r"\btaxi\b", r"\bbus\b", r"\bmetro\b", r"\bpetrol\b", r"\bfuel\b",
        r"\bshell\b", r"\bhpcl\b", r"\bbpcl\b", r"\bindianoil\b", r"\brapido\b",
        r"\bixigo\b", r"\bredbus\b", r"\bclarity\s+travels\b", r"\bair\s+india\b",
        r"\bindigo\b", r"\bspicejet\b", r"\bvistara\b", r"\bgofirst\b", r"\btrip\b",
        r"\btoll\b", r"\bfastag\b", r"\bnational\s+highway\b", r"\bparking\b",
        r"\btrain\b", r"\bticket\b", r"\btravel\b", r"\bairport\b", r"\bport\b",
        r"\bship\b", r"\bcruise\b", r"\btransport\b", r"\btransit\b",
        r"\bcar\s+rental\b", r"\bbike\s+rental\b", r"\bselfie\s+drive\b",
        r"\bzoomcar\b", r"\bliteyatra\b", r"\bpetrol\s+pump\b", r"\bfilling\s+station\b",
        r"\bmovement\b", r"\bjourney\b", r"\bcommute\b",
    ],
    "Shopping": [
        r"\bamazon\b", r"\bflipkart\b", r"\bmyntra\b", r"\bgrocery\b", r"\bdmart\b",
        r"\bsupermarket\b", r"\bretail\b", r"\bclothing\b", r"\bapparel\b",
        r"\bfootwear\b", r"\bmall\b", r"\bdecathlon\b", r"\bnykaa\b", r"\blenskart\b",
        r"\belectronics\b", r"\bfashion\b", r"\bmeesho\b", r"\bjiomart\b",
        r"\bblinkit\b", r"\bzepto\b", r"\binstamart\b", r"\bajio\b", r"\breliance\s+digital\b",
        r"\bviolet\s+bags\b", r"\bwestside\b", r"\bpantaloons\b", r"\btrent\b",
        r"\bshopclues\b", r"\bsnapdeal\b", r"\bindiamart\b", r"\bbigbasket\b",
        r"\bgroceries\b", r"\bhypermarket\b", r"\bwholesale\b", r"\bbrand\b",
        r"\bsarees\b", r"\bkirana\b", r"\bmarket\b", r"\bstores\b", r"\bshop\b",
        r"\boutlet\b", r"\bpurchase\b", r"\bbuying\b", r"\bmerchant\b",
        r"\bamazon\s+pay\b", r"\bfk\s+axis\b", r"\bfk\s+bank\b", r"\bcroma\b",
        r"\bspencer\b", r"\bmore\s+supermarket\b", r"\bstar\s+bazaar\b",
        r"\bvijay\s+sales\b", r"\breliance\s+mart\b", r"\bikea\b",
    ],
    "Utilities": [
        r"\belectricity\b", r"\bbescom\b", r"\bpower\b", r"\bwater\b", r"\bsewer\b",
        r"\bgas\b", r"\bindane\b", r"\bhp\s+gas\b", r"\bbharat\s+gas\b",
        r"\butility\b", r"\bmunicipal\b", r"\bwaste\b", r"\belectric\b",
        r"\bmseb\b", r"\bbses\b", r"\btata\s+power\b", r"\bcesc\b", r"\btorrent\b",
        r"\bwapco\b", r"\bwesco\b", r"\bsouth\s+electricity\b", r"\bnorth\s+electricity\b",
        r"\bwater\s+board\b", r"\bwater\s+bill\b", r"\bsewer\s+bill\b",
        r"\bgas\s+bill\b", r"\bmuncipal\s+tax\b", r"\bproperty\s+tax\b",
        r"\bhouse\s+tax\b", r"\belectricity\s+bill\b", r"\bpower\s+bill\b",
        r"\bdiscom\b", r"\bwdhb\b", r"\bkseb\b", r"\bseb\b", r"\buppcl\b",
        r"\bappdcl\b", r"\btsecl\b", r"\btnebl\b", r"\bgerc\b", r"\bmerc\b",
        r"\bwb\s+electricity\b", r"\bgail\b", r"\bindraprastha\s+gas\b",
        r"\bmahanagar\s+gas\b", r"\bcleaner\b", r"\bsanitation\b",
    ],
    "Telecom": [
        r"\bjio\b", r"\bairtel\b", r"\bvodafone\b", r"\bvi\s+recharge\b", r"\bidea\b",
        r"\bbroadband\b", r"\btelecom\b", r"\binternet\b", r"\bbsnl\b",
        r"\bact\s+fibernet\b", r"\btata\s+play\b", r"\bdishtv\b",
        r"\bmobile\s+recharge\b", r"\brecharge\b", r"\bpostpaid\b", r"\bprepaid\b",
        r"\bwifi\b", r"\bsim\b", r"\bdata\s+plan\b", r"\bvode\b", r"\bvi\b",
        r"\bm2m\b", r"\blandline\b", r"\bvideocall\b", r"\bott\s+pack\b",
        r"\bjio\s+fiber\b", r"\bairtel\s+fiber\b", r"\bairtel\s+broadband\b",
        r"\bact\s+broadband\b", r"\bhathway\b", r"\bspectranet\b",
        r"\btata\s+sky\b", r"\bsun\s+direct\b", r"\bvideo\s+con\b", r"\bd2h\b",
        r"\bcable\s+tv\b", r"\bsatellite\b", r"\bbsnl\s+recharge\b",
        r"\bjio\s+recharge\b", r"\bairtel\s+recharge\b",
    ],
    "Entertainment": [
        r"\bnetflix\b", r"\bprime\s+video\b", r"\bamazon\s+prime\b", r"\bhotstar\b",
        r"\bspotify\b", r"\bbookmyshow\b", r"\bcinema\b", r"\bmovie\b",
        r"\btheater\b", r"\bgaming\b", r"\bsteam\b", r"\bplaystation\b",
        r"\bxbox\b", r"\byoutube\b", r"\bconcert\b", r"\bclub\b", r"\bzee5\b",
        r"\bsonyliv\b", r"\bult\b", r"\bvoot\b", r"\bdisney\b", r"\bjiocinema\b",
        r"\balt\s+balaji\b", r"\berosst\b", r"\bades\b", r"\bamusement\b",
        r"\bfun\s+zone\b", r"\bwater\s+park\b", r"\btheme\s+park\b",
        r"\bcomedy\b", r"\bcircus\b", r"\bzoo\b", r"\bmuseum\b", r"\bpark\b",
        r"\bapple\s+music\b", r"\bgaana\b", r"\bjiosaavn\b", r"\bwinzo\b",
        r"\bdream11\b", r"\bmpl\b", r"\bgame\b", r"\bonline\s+gaming\b",
        r"\bpubg\b", r"\bvideogame\b", r"\besport\b", r"\bstreaming\b",
    ],
    "Healthcare": [
        r"\bhospital\b", r"\bpharmacy\b", r"\bapollo\b", r"\bmedplus\b",
        r"\bclinic\b", r"\bdoctor\b", r"\bdentist\b", r"\bmedical\b",
        r"\bmedicine\b", r"\bpharmeasy\b", r"\b1mg\b", r"\bdiagnostics\b",
        r"\blab\b", r"\boptician\b", r"\bsurgery\b", r"\bnursing\b",
        r"\bicu\b", r"\bward\b", r"\bhealthcare\b", r"\bhealth\b",
        r"\bwellness\b", r"\bvaccine\b", r"\bvaccination\b", r"\bblood\s+test\b",
        r"\burine\s+test\b", r"\bx-ray\b", r"\bultrasound\b", r"\bmri\b",
        r"\bct\s+scan\b", r"\bmedfast\b", r"\bnetmeds\b", r"\btata\s+health\b",
        r"\bfortis\b", r"\bmax\s+hospital\b", r"\baiims\b", r"\bpgi\b",
        r"\bnarayana\b", r"\bsunshine\b", r"\bgolden\s+hospital\b",
        r"\bmanipal\b", r"\bmedanta\b", r"\bkims\b", r"\bappolo\b",
        r"\bdental\b", r"\beye\s+care\b", r"\bvision\b", r"\bphysio\b",
        r"\bfitness\b", r"\bgym\b", r"\byoga\b",
    ],
    "Education": [
        r"\bschool\b", r"\bcollege\b", r"\buniversity\b", r"\btuition\b",
        r"\bcourse\b", r"\budemy\b", r"\bcoursera\b", r"\bedx\b", r"\bfees\b",
        r"\bcoaching\b", r"\bacademy\b", r"\btraining\b", r"\btextbook\b",
        r"\bbyju\b", r"\bunacademy\b", r"\bvedantu\b", r"\bwhitehat\b",
        r"\bphysics\s+wallah\b", r"\blido\b", r"\bscholar\b", r"\bdegree\b",
        r"\bmba\b", r"\bexam\b", r"\btest\s+fee\b", r"\bregistration\s+fee\b",
        r"\badmission\b", r"\bhostel\s+fee\b", r"\blibrary\b", r"\blab\s+fee\b",
        r"\bsemester\b", r"\bannual\s+fee\b", r"\bterm\s+fee\b",
        r"\bconveyance\s+fee\b", r"\bskill\b", r"\blearning\b", r"\bworkshop\b",
        r"\bseminar\b", r"\bconference\b", r"\bcertification\b", r"\bcert\b",
        r"\beducation\b", r"\binstitute\b", r"\bkids\s+learn\b",
    ],
    "Investments": [
        r"\bzerodha\b", r"\bgroww\b", r"\bupstox\b", r"\bmutual\s+fund\b",
        r"\bsip\b", r"\bdemat\b", r"\bstock\b", r"\bshares\b", r"\bbond\b",
        r"\betf\b", r"\bcoin\b", r"\bwazirx\b", r"\bkuvera\b", r"\bsmallcase\b",
        r"\binvestment\b", r"\bnsdl\b", r"\bcdsl\b", r"\bbse\b", r"\bnse\b",
        r"\bipo\b", r"\bright\s+issue\b", r"\bdividend\b", r"\bdebenture\b",
        r"\bfd\b", r"\bfixed\s+deposit\b", r"\brd\b", r"\brecurring\s+deposit\b",
        r"\bgold\s+bond\b", r"\bsovereign\s+gold\b", r"\bpms\b",
        r"\bpension\b", r"\bnps\b", r"\bnational\s+pension\b", r"\bpf\b",
        r"\bppf\b", r"\belss\b", r"\bindex\s+fund\b", r"\bdebt\s+fund\b",
        r"\bequity\s+fund\b", r"\bfolio\b", r"\bbroker\b", r"\btrading\b",
        r"\bsharemarket\b", r"\bfintech\b", r"\bangelone\b", r"\b5paisa\b",
        r"\bshoonya\b", r"\bindmoney\b", r"\binvst\b", r"\bsaving\s+scheme\b",
    ],
    "Insurance": [
        r"\blic\b", r"\bhdfc\s+ergo\b", r"\bmax\s+life\b", r"\bsbi\s+life\b",
        r"\binsurance\b", r"\bpremium\b", r"\bpolicy\b", r"\bmediclaim\b",
        r"\btata\s+aia\b", r"\bstar\s+health\b", r"\bcare\s+health\b",
        r"\bicici\s+pru\b", r"\bicici\s+prudential\b", r"\bhdfc\s+life\b",
        r"\bmax\s+bupa\b", r"\breliance\s+life\b", r"\baditya\s+birla\s+life\b",
        r"\bbirla\s+sun\s+life\b", r"\bfuture\s+generali\b", r"\bbajaj\s+allianz\b",
        r"\bnational\s+insurance\b", r"\bunited\s+india\b", r"\bnew\s+india\b",
        r"\boriental\s+insurance\b", r"\bapollo\s+munich\b", r"\bdigit\b",
        r"\backo\b", r"\binsure\b", r"\bclaim\b", r"\bterm\s+plan\b",
        r"\blife\s+insurance\b", r"\bhealth\s+insurance\b", r"\bmotor\s+insurance\b",
        r"\bvehicle\s+insurance\b", r"\bcar\s+insurance\b", r"\bbike\s+insurance\b",
        r"\btravel\s+insurance\b", r"\bhome\s+insurance\b", r"\bsbi\s+general\b",
    ],
    "Cash Withdrawal": [
        r"\batm\b", r"\bcash\s+wdl\b", r"\bcash\s+withdrawal\b", r"\batm\s+wdl\b",
        r"\bteller\b", r"\bwithdrawal\s+branch\b", r"\bself\s+check\b",
        r"\bcash\s+payout\b", r"\bcash\s+adv\b", r"\bcash\s+advance\b",
        r"\batm\s+withdrawal\b", r"\bcash\s+drawn\b", r"\bwithdraw\b",
        r"\bcash\s+out\b", r"\bwdl\b", r"\batm\s+debit\b", r"\batm\s+txn\b",
        r"\bcash\s+from\s+atm\b", r"\batm\s+cash\b", r"\batm\s+charge\b",
        r"\binterbank\s+atm\b", r"\bswitch\s+charge\b",
    ],
    "UPI / Transfer": [
        r"\bupi[-/]\b", r"\bupi\b", r"\bgpay\b", r"\bpaytm\b", r"\bphonepe\b",
        r"\bbhim\b", r"\bp2p\b", r"\btransfer\s+to\b", r"\btransfer\s+from\b",
        r"\bimps\b", r"\bneft\b", r"\brtgs\b", r"\bfund\s+transfer\b",
        r"\bft\b", r"\btrfr\b", r"\bpeer\s+transfer\b", r"\bbank\s+transfer\b",
        r"\baccount\s+transfer\b", r"\binter\s+bank\b", r"\bmobile\s+banking\b",
        r"\bnet\s+banking\b", r"\bonline\s+transfer\b", r"\bremittance\b",
        r"\bwire\s+transfer\b", r"\binward\s+remit\b", r"\boutward\s+remit\b",
        r"\bcash\s+dep\b", r"\bcash\s+deposit\b", r"\bin\s+clg\b",
        r"\bcheque\s+dep\b", r"\bcheque\s+return\b", r"\bcheque\s+bounce\b",
        r"\binward\s+chq\b", r"\boutward\s+chq\b", r"\bclearing\b",
        r"\bthrough\s+upi\b", r"\bmoney\s+transfer\b", r"\bsend\s+money\b",
        r"\breceived\s+money\b", r"\bbeneficiary\b", r"\bpaytm\s+pay\b",
        r"\bpay\s+to\b",
    ],
    "Rent": [
        r"\brent\b", r"\bhouse\s+rent\b", r"\bowner\b", r"\blandlord\b",
        r"\bpg\s+accommodation\b", r"\bsecurity\s+deposit\b",
        r"\brent\s+payment\b", r"\bmonthly\s+rent\b", r"\brental\b",
        r"\btenant\b", r"\blease\b", r"\bflat\s+rent\b", r"\broom\s+rent\b",
        r"\baccommodation\b", r"\bhostel\b", r"\bpaying\s+guest\b",
        r"\bstay\s+payment\b", r"\brent\s+advance\b",
    ],
}

# Pre-compile all patterns for performance
_COMPILED_PATTERNS: dict = {}
for _cat, _patterns in CATEGORY_KEYWORDS.items():
    _COMPILED_PATTERNS[_cat] = [re.compile(p, re.IGNORECASE) for p in _patterns]


class CategorizationEngine:
    @staticmethod
    def categorize(description: str) -> Tuple[str, float]:
        """
        Categorizes a transaction based on its description text using regex.
        Returns a tuple: (category_name, confidence_score)
        Category names match the assignment specification exactly.
        """
        if not description:
            return "Other", 1.0

        desc_lower = description.lower()

        # Priority order: specific high-value categories first so that
        # e.g. "UPI-SWIGGY" → Food & Dining, NOT UPI / Transfer.
        priority_order = [
            "Salary", "EMI / Loan", "Rent", "Insurance", "Investments",
            "Healthcare", "Education", "Food & Dining", "Travel", "Shopping",
            "Telecom", "Utilities", "Entertainment", "Cash Withdrawal",
            "UPI / Transfer",
        ]

        for category in priority_order:
            patterns = _COMPILED_PATTERNS[category]
            for pattern in patterns:
                match = pattern.search(desc_lower)
                if match:
                    start_pos = match.start()
                    confidence = 1.0
                    if start_pos > 30:
                        confidence -= 0.10   # keyword found deep in description

                    # UPI generic transfers get slightly lower confidence than
                    # specific merchant matches
                    if category == "UPI / Transfer":
                        if "transfer to" in desc_lower or "upi-" in desc_lower or "upi/" in desc_lower:
                            confidence = 0.90
                        else:
                            confidence = 0.80

                    return category, round(max(confidence, 0.5), 2)

        return "Other", 1.0
