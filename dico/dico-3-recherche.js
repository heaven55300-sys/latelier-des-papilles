/* DICO 3 : recherche, filtres, robots, navigation */
(function(){
const D=window.DICO;if(!D||!D.alts){console.warn('dico-3 : moteur absent');return}
const NB=D.NB,NOCOOK=['home','favs','courses','recipe','fridge','create','credits'],NAV=['home','favs','courses','fridge','create','credits','recipe'];
D.alts('surprends moi',['choisis pour moi','choisis moi quelque chose','decide pour moi','t as une idee','tu as une idee','une idee de recette','une idee de repas','une idee pour ce soir','une idee pour ce midi','une idee pour le diner','une idee pour le dejeuner','je n ai pas d idee','j ai pas d idee','j ai pas d inspiration','je manque d inspiration','donne moi une idee','propose moi quelque chose','propose quelque chose','propose moi une recette','que me proposes tu','que proposes tu','qu est ce que tu me proposes','tire au sort','tire une recette au hasard','lance les des','on mange quoi ce soir','on mange quoi ce midi','on mange quoi demain','qu est ce qu on mange ce soir','qu est ce qu on mange ce midi','quoi manger ce soir','quoi manger ce midi','que cuisiner ce soir','que faire a manger','que faire pour le diner','quoi pour le diner','quoi pour le dejeuner','j ai faim','on a faim','j ai la dalle','ca creuse','etonne moi','etonne nous','inspire nous','je veux une surprise','une recette surprise'],NOCOOK);
D.alts('recettes express',['recettes rapides','recette rapide','rapide','vite fait','pas long','pas trop long','moins de vingt minutes','moins de 20 minutes','ca presse','j ai pas le temps','je n ai pas le temps','je suis presse','je suis presse par le temps','pour ce soir vite','dix minutes chrono','quick','plat rapide','un plat rapide','quelque chose de rapide','quelque chose de vite fait','repas rapide','express','les recettes express','recettes de moins de 20 minutes'],NOCOOK);
D.alts('recettes au four',['au four','les recettes au four','je veux utiliser le four','je veux cuisiner au four','on allume le four','plat au four','je cuisine au four','cuisson au four','recettes de four','en four','j utilise le four','mode four','four'],NOCOOK);
D.alts('recettes plaque',['sur la plaque','a la poele','induction','gaz','plaque de cuisson','cuisson a la poele','sur le feu','recettes poele','les recettes plaque','recettes a la casserole','au gaz','a l induction','sur plaque','a la casserole','mode plaque','je cuisine a la poele','je cuisine sur la plaque','plaque'],NOCOOK);
D.alts('mode robot',['avec mon robot','je veux utiliser mon robot','je cuisine au robot','robot cuiseur','robot de cuisine','robot cuisine','multicuiseur','multi cuiseur','cuiseur','au robot','recettes robot','recettes au robot','les recettes robot','choisir mon robot','changer de robot','change de robot','mon robot','le robot','mode robot'],NOCOOK);
D.alts('airfryer',['friteuse a air','friteuse sans huile','air fryer','friteuse a air chaud','friteuse','fritteuse a air'],NOCOOK);
D.alts('toutes les recettes',['mes recettes','toutes mes recettes','la liste des recettes','les recettes','voir toutes les recettes','affiche les recettes','montre les recettes','montre moi les recettes','je veux voir mes recettes','mon livre de recettes','mon carnet','mon carnet de recettes','livre de recettes'],NOCOOK);
D.alts('favoris',['mes favoris','mes preferes','recettes preferees','mes coups de coeur','ce que j aime','mes recettes favorites','recettes favorites','la liste des favoris','affiche mes favoris','montre mes favoris','mes recettes preferees','ouvre mes favoris','voir mes favoris','mes recettes cheries'],NOCOOK);
D.alts('accueil',['retour a l accueil','retourne a l accueil','reviens a l accueil','page d accueil','l accueil','ecran d accueil','premiere page','retour a la page principale','retourne a la page principale','menu principal','le menu','menu','retour au menu','decouvrir','la page principale','a l accueil','ramene moi a l accueil','ramene moi au debut','va a l accueil','rentre a la maison'],['recipe','favs','courses','fridge','create','credits','home']);
D.alts('frigo',['scanne mon frigo','scanne le frigo','scanner mon frigo','scanner le frigo','photographie le frigo','photographie mon frigo','regarde dans le frigo','regarde mon frigo','qu est ce qu il y a dans le frigo','analyse mon frigo','analyse le frigo','que puis je cuisiner avec ce que j ai','qu est ce que je peux cuisiner avec ce que j ai','que faire avec ce que j ai','que faire avec les restes','j ai des restes','recette anti gaspi','anti gaspi','anti gaspillage','ouvre le frigo','mon frigo','le frigo','le refrigerateur','frigidaire'],NOCOOK);
D.alts('creer',['ajoute ma recette','je veux creer','creation','creer une recette','je veux creer une recette','j ai une recette','je veux ajouter une recette','enregistre une recette','ma propre recette','ecrire une recette','je veux ecrire une recette','nouvelle recette','je veux saisir une recette','saisir une recette','ajouter une recette','rajoute une recette','cree une recette','cree moi une recette','creer ma recette','ma recette perso','recette perso'],NOCOOK);
D.alts('credits photos',['credits','les credits','credits photos','a propos','d ou viennent les photos','d ou vienne les photos','les photos viennent d ou','qui a fait les photos','auteur des photos','source des photos','licences','licences des photos'],NOCOOK);
D.alts('prends la photo',['photographie','capture l image','capture','clic','clique','prends en photo','fais une photo','fais la photo','cheese','ouistiti','souris','c est bon prends la','prends la','photo','prends une photo','declenche','declenche la photo','shoot','immortalise'],['fridge']);
D.alts('active la camera',['allume la camera','demarre la camera','ouvre la camera','lance la camera','active l appareil photo','ouvre l appareil photo','allume l appareil photo','mets la camera','camera','l appareil photo','appareil photo'],['fridge']);
D.add([
 ['(?:je veux manger|j ai faim de|je voudrais manger|je mangerais bien|je me ferais bien|je me mangerais bien|ca me dit|ca me dirait) (.+)','cherche $1'],
 ['(?:donne moi|donne nous|propose moi|propose nous|montre moi|montre nous|trouve moi|trouve nous) (?:une |un |des |de la |du |de l )?(?:recettes? |idees? |plats? )(?:de |d |du |des |a base de |avec )?(.+)','cherche $1'],
 ['(?:une |des )?recettes? (?:de |d |du |des |a base de |avec |au |aux |a la |a l )(.+)','cherche $1'],
 ['(?:que|quoi|qu est ce que je peux|qu est ce qu on peut|qu est ce que l on peut|je peux faire quoi|on peut faire quoi) (?:faire|cuisiner|preparer) (?:avec|a partir de) (.+)','cherche $1'],
 ['(?:j ai|il me reste|il reste|on a|j ai encore) (?:du |de la |des |de l |un |une |de |d )?(.+) (?:que faire|quoi en faire|et je sais pas quoi en faire|et je ne sais pas quoi en faire|que cuisiner|quoi cuisiner|quoi faire)','cherche $1'],
 ['(?:une |des |la |le )?(?:video|videos|tuto|tutos|tutoriel|tutoriels) (?:de |d |du |des |sur |pour )?(?:la |le |les |l )?(.+)','cherche $1 sur youtube'],
 ['(?:regarde|montre|je veux voir|je veux regarder|trouve) (?:moi )?(?:une |des )?(?:video|videos)? ?(?:de |d |du |des |sur |pour )?(.+) (?:sur youtube|youtube)','cherche $1 sur youtube'],
 ['(?:youtube|you tube) (.+)','cherche $1 sur youtube'],
 ['(?:tiktok|tik tok) (.+)','cherche $1 sur tiktok'],
 ['(?:instagram|insta) (.+)','cherche $1 sur instagram'],
 ['(?:reel|reels) (?:de |d |du |des )?(.+)','cherche $1 sur instagram'],
 ['facebook (.+)','cherche $1 sur facebook'],
 ['pinterest (.+)','cherche $1 sur pinterest'],
 ['marmiton (.+)','cherche $1 sur marmiton'],
 ['(?:google|googlise|cherche sur google) (.+)','cherche $1 sur google'],
 ['(?:le |mon |un |ma )?(?:tm|t m) ?('+NB+')','thermomix tm $1'],
 ['(?:le |mon |un |ma |la )?(?:thermo mix|thermomixe|termomix|thermomixte)(.*)','thermomix$1'],
 ['(?:le |mon |un |ma |la )?(?:cook expert|cookexpert)','magimix cook expert'],
 ['(?:le |mon |un |ma |la )?(?:prep and cook|prep cook|prepandcook)','krups prep cook'],
 ['(?:le |mon |un |ma |la )?(?:kcook|k cook|kcook multi smart)','kenwood kcook'],
 ['(?:le |mon |un |ma |la )?(?:cooking chef|cooking chef xl)','kenwood cooking chef'],
 ['(?:le |mon |un |ma |la )?(?:i companion|icompanion|companion xl|companion)','companion'],
 ['(?:le |mon |un |ma |la )?(?:monsieur cuisine|monsieur cuisine connect|mon sieur cuisine|lidl cuisine)','monsieur cuisine'],
 ['(?:le |mon |un |ma |la )?(?:cookeo|cookeo plus|cookeo touch|cookeo connect)','cookeo'],
 ['(?:le |mon |un |ma |la )?(?:ninja foodi|ninja|foodi)','ninja'],
 ['(?:le |mon |un |ma |la )?(?:instant pot|instantpot)','instant pot']
],NOCOOK);
})();
