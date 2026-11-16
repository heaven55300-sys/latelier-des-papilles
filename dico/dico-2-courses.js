/* DICO 2 : liste de courses et fiche recette */
(function(){
const D=window.DICO;if(!D||!D.alts){console.warn('dico-2 : moteur absent');return}
const NB=D.NB,NC=['home','favs','courses','recipe','fridge','create','credits'],RC=['recipe'];
D.alts('quoi acheter',['quoi acheter','il me faut acheter quoi','je dois acheter quoi','j achete quoi','je prends quoi','on achete quoi','qu est ce qu il me manque','qu est ce qui manque','dis moi ce qui manque','ce qui manque','il manque quoi','c est quoi qui manque','que dois je acheter','qu est ce que je dois acheter'],NC);
D.alts('combien d articles',['combien d articles','combien d elements','combien d elements dans ma liste','combien de choses a acheter','combien de produits','combien j ai d articles','il y a combien d articles','ma liste est longue','combien de trucs','combien de courses'],NC);
D.alts('retire les articles coches',['nettoie la liste','nettoie ma liste','supprime les coches','supprime ce qui est coche','enleve les coches','retire les coches','efface les coches','efface ce qui est barre','vire les coches','retire ce que j ai pris','enleve ce que j ai pris','enleve ce qui est raye','retire ce qui est coche','enleve les articles raye','supprime les articles pris'],NC);
D.alts('vide la liste de courses',['efface toute la liste','efface toute la liste de courses','supprime toute la liste','recommence la liste','nouvelle liste','nouvelle liste de courses','liste vierge','repars de zero pour la liste','reinitialise la liste','tout effacer dans la liste','vide mes courses','vide ma liste'],NC);
D.alts('partage ma liste',['envoie moi la liste','envoie ma liste','envoie la liste','envoie la liste de courses','partage la liste','partage les courses','copie la liste','copie ma liste','exporte la liste','je veux envoyer ma liste','donne moi la liste a envoyer','envoie la liste de courses a quelqu un','transfere la liste'],NC);
D.alts('lis ma liste de courses',['je vais faire les courses','je pars faire les courses','je fais les courses','on va faire les courses','je suis au supermarche','je suis au magasin','je suis en course','rappelle moi ma liste','rappelle moi la liste','dis moi ma liste','qu est ce qu il y a sur ma liste','c est quoi ma liste','dicte moi ma liste','dicte la liste'],NC);
D.alts('courses',['ma liste','la liste','ma liste de courses','la liste de courses','mes courses','les courses','montre ma liste','ouvre ma liste','ouvre la liste','ouvre la liste de courses','va sur ma liste','affiche mes courses','affiche la liste','affiche ma liste','voir ma liste','mon panier','mon caddie','le caddie','le panier','mes achats','pense bete'],NC);
D.add([
 ['(?:pense a|pensez a) (?:acheter |prendre )?(.+)','note $1'],
 ['n oublie pas (?:de |d |du |des )?(?:acheter |prendre )?(.+)','note $1'],
 ['(?:je dois|on doit|il faut que j|faut que j|il faut que je|faut que je|il faut que on|faut que on) (?:acheter|achete|prendre|prenne|racheter) (.+)','note $1'],
 ['(?:il faut|faut|faudra|faudrait|a) (?:acheter|racheter|prendre) (.+)','note $1'],
 ['(?:il faut|il me faut|il nous faut) (?:racheter|reprendre) (.+)','note $1'],
 ['(?:on n a plus|on a plus|il n y a plus|y a plus|il ne reste plus|je n ai plus) (?:de |d |du |des )?(.+)','note $1'],
 ['plus (?:de |d |du |des )(.+)','note $1'],
 ['(?:il manque|manque|on manque de|je manque de|il nous manque|il me manque) (?:de |d |du |des )?(.+)','note $1'],
 ['(?:on n a pas|je n ai pas|j ai pas|on a pas|il n y a pas) (?:de |d |du |des )(.+)','note $1'],
 ['(?:ecris|ecrit|inscris|rajoute|ajoute) (.+) (?:sur|dans|a) (?:ma |la |mes )?(?:liste|courses)','note $1'],
 ['j ai besoin (?:de |d |du |des )(.+)','note $1'],
 ['(?:rachete|racheter|reprends|reprendre) (.+)','note $1']
],NC);
/* fiche recette */
D.alts('ajoute la recette a ma liste de courses',['ajoute les ingredients a ma liste','ajoute les ingredients aux courses','mets les ingredients dans ma liste','mets tout dans ma liste','ajoute tout a ma liste','envoie les ingredients dans ma liste','envoie ca a ma liste de courses','ajoute ca a ma liste de courses','ajoute ca aux courses','ajoute ce qui manque a ma liste','mets ce qui manque dans mes courses','ajoute les ingredients manquants','ajoute les manquants','il me manque des ingredients','il me manque des trucs','on a pas tout','j ai pas tout','je n ai pas tout','on n a pas tout','prepare mes courses','prepare ma liste de courses','fais ma liste de courses','fais la liste de courses','fais moi la liste de courses','cree la liste de courses','genere la liste de courses','liste de courses pour cette recette','mes courses pour cette recette'],RC);
D.alts('j ai tout',['j ai tous les ingredients','j ai tout ce qu il faut','j ai tout ce qu il me faut','j ai tout ce qu on demande','tout est la','rien a acheter','je n ai rien a acheter','je dois rien acheter','tout cocher','coche tous les ingredients','coche les ingredients','coche tout','on a tous les ingredients'],RC);
D.alts('mets en favori',['ajoute aux favoris','mets cette recette en favori','j adore','j adore cette recette','j aime cette recette','je la garde','garde cette recette','sauvegarde cette recette','enregistre cette recette','c est ma preferee','mon coup de coeur','je veux la retrouver','marque cette recette','favori','en favori','mets la en favori','mets le en favori','ajoute cette recette aux favoris'],RC);
D.alts('enleve des favoris',['plus en favori','retire cette recette des favoris','retire des favoris','supprime des favoris','je n aime pas cette recette','je l aime plus','je ne l aime plus','enleve cette recette des favoris','retire le favori'],RC);
D.alts('mode cuisine',['commence a cuisiner','on commence','on commence la recette','allons cuisiner','je commence','je me lance','passe en mode cuisine','active le mode cuisine','ouvre le mode cuisine','demarre le mode cuisine','mode pas a pas','pas a pas','cuisine pas a pas','guide moi','guide moi pas a pas','accompagne moi','aide moi a cuisiner','on fait la recette','on se met aux fourneaux','aux fourneaux','a table','on cuisine ensemble','cuisinons ensemble','je suis pret a cuisiner','je suis pret a commencer'],RC);
D.alts('preparation',['montre les etapes','montre la preparation','affiche les etapes','affiche la preparation','passe a la preparation','va a la preparation','onglet preparation','les etapes','la preparation','instructions','comment on fait','comment je fais','comment ca se prepare','comment faire','c est quoi la recette','la methode','la methode de preparation','le deroule','les instructions','voir les etapes','voir la preparation'],RC);
D.alts('ingredients',['montre les ingredients','affiche les ingredients','onglet ingredients','voir les ingredients','les ingredients','va aux ingredients','retour aux ingredients','liste des ingredients'],RC);
D.alts('lis les ingredients',['dis moi les ingredients','rappelle moi les ingredients','lis moi les ingredients','dicte les ingredients','dicte moi les ingredients','dis les ingredients','a voix haute les ingredients','lis les quantites','dis moi les quantites'],RC);
D.alts('retour',['retourne aux recettes','reviens aux recettes','reviens a la liste des recettes','ferme la fiche','ferme la recette','sors de la recette','quitte la recette','page precedente','retour aux recettes','revenir aux recettes','retourne en arriere','revenir en arriere'],RC);
D.alts('duree de la recette',['combien de temps ca prend','ca prend combien de temps','c est long a faire','c est rapide a faire','temps total','temps total de la recette','quelle est la duree de la recette','combien de temps pour la recette','combien de temps pour la faire','combien de temps pour cuisiner','c est long comment','ca dure combien de temps','ca prend longtemps','c est long','c est rapide','ca va vite'],RC);
D.alts('difficulte',['c est difficile','c est dur','c est facile','est ce que c est facile','est ce que c est difficile','quel niveau','quelle difficulte','niveau de difficulte','c est complique','c est simple','ca se fait facilement','niveau','je suis debutant est ce facile'],RC);
D.alts('mode de cuisson',['ca se cuit comment','on cuit comment','il faut un four','il faut le four','faut il un four','il faut un robot','faut il un robot','quel appareil','avec quoi on cuit','avec quoi je cuis','c est au four ou a la plaque','c est pour le robot','quel mode de cuisson','dans quoi ca cuit','on utilise quoi','je dois utiliser quoi','quel materiel'],RC);
D.alts('on est 1',['je suis seul','je suis seule','je mange seul','je mange seule','juste pour moi','pour moi tout seul','pour moi toute seule','pour moi seul','pour moi seule','rien que pour moi','seul','seule','une seule personne','pour une personne'],RC);
D.alts('on est 2',['en couple','en amoureux','pour nous deux','a deux','nous deux','pour deux','on est en couple','dîner a deux'],RC);
D.alts('une personne de plus',['une assiette de plus','un couvert de plus','un invite de plus','un convive de plus','un convive en plus','une personne en plus','encore une personne','un de plus','une personne supplementaire','un invite supplementaire','ajoute une personne','rajoute une personne','un de plus a table','une bouche de plus'],RC);
D.alts('une personne de moins',['une assiette de moins','un couvert de moins','un invite de moins','un convive de moins','un convive en moins','une personne en moins','une personne de moins','enleve une personne','retire une personne','un de moins','un en moins','un absent'],RC);
D.alts('double',['double','doubler','double les quantites','double la recette','fais le double','pour deux fois plus','quantites doublees','deux fois plus','x 2','multiplie par deux','multiplie par 2'],RC);
D.alts('triple',['triple','tripler','triple la recette','fais le triple','trois fois plus','multiplie par trois','multiplie par 3','x 3'],RC);
D.alts('moitie',['la moitie','moitie moins','divise par deux','divise par 2','reduis de moitie','deux fois moins','2 fois moins','une demi portion','demi portion','coupe en deux','reduis de moitie la recette','la moitie de la recette'],RC);
D.add([
 ['(?:on sera|nous serons|il y aura|ca fera|on va etre|nous allons etre) ('+NB+')(?: personnes?| a table| au total| couverts| invites)?','on est $1'],
 ['(?:je )?(?:cuisine|prepare|fais|fait) (?:ca |cela |la recette |le plat )?pour ('+NB+')(?: personnes?| couverts| invites)?','pour $1 personnes'],
 ['(?:on est|nous sommes) ('+NB+') a table','on est $1'],
 ['('+NB+') a table','on est $1'],
 ['(?:recette|quantites) pour ('+NB+')(?: personnes?)?','pour $1 personnes'],
 ['(?:passe|passer|mets|met|change|changer|regle|regler) (?:le nombre de personnes |les portions |les parts )?(?:a|sur|pour|en) ('+NB+')(?: personnes?| portions?| parts?)?','pour $1 personnes'],
 ['(?:coche|coches|raye|raye moi|barre|j ai pris|j ai deja|j ai) (?:le |la |les |l |du |de la |des |de |d )?(.+) (?:dans la recette|de la recette|a la maison|chez moi)','coche $1']
],RC);
})();
