/* DICO 5 : culture culinaire. Répond seulement si aucune commande ne correspond. Valeurs indicatives. */
(function(){
const D=window.DICO;if(!D||!D.qaAdd){console.warn('dico-5 : moteur absent');return}
const f=x=>String(Math.round(x*10)/10).replace('.',',');
const VOL={ml:1,cl:10,dl:100,l:1000,litre:1000,litres:1000};
const POI={g:1,gramme:1,grammes:1,kg:1000,kilo:1000,kilos:1000,once:28.35,onces:28.35,oz:28.35,livre:500,livres:500};
const G={farine:10,sucre:15,beurre:15,huile:14,miel:20,lait:15,eau:15,creme:15,maizena:10,fecule:10,cacao:8,sel:18};
D.qaAdd([
['(\\d+(?:\\.\\d+)?) (?:degres? )?(?:celsius )?(?:en|vers|c est combien en|ca fait combien en) fahrenheit',m=>m[1]+' degrés Celsius font environ '+f(m[1]*9/5+32)+' degrés Fahrenheit.','conversion'],
['(\\d+(?:\\.\\d+)?) (?:degres? )?fahrenheit (?:en|vers|c est combien en|ca fait combien en) (?:celsius|degres)',m=>m[1]+' degrés Fahrenheit font environ '+f((m[1]-32)*5/9)+' degrés Celsius.','conversion'],
['(\\d+(?:\\.\\d+)?) (cl|dl|ml|l|litres?|g|grammes?|kg|kilos?|onces?|oz|livres?) (?:en|c est combien de|ca fait combien de|c est combien en|ca fait combien en|combien de) (cl|dl|ml|l|litres?|g|grammes?|kg|kilos?|onces?|oz|livres?)',m=>{
  const n=parseFloat(m[1]),a=m[2],b=m[3];
  if(VOL[a]&&VOL[b])return m[1]+' '+a+' font '+f(n*VOL[a]/VOL[b])+' '+b+'.';
  if(POI[a]&&POI[b])return m[1]+' '+a+' font environ '+f(n*POI[a]/POI[b])+' '+b+'. Une livre vaut ici 500 grammes.';
  return 'Je ne peux pas convertir ces deux unités entre elles.';},'conversion'],
['(\\d+) cuilleres? a (soupe|cafe) de (farine|sucre|beurre|huile|miel|lait|eau|creme|maizena|fecule|cacao|sel)',m=>{const g=G[m[3]]*(m[2]==='soupe'?1:1/3)*m[1];return m[1]+' cuillère'+(m[1]>1?'s':'')+' à '+(m[2]==='soupe'?'soupe':'café')+' de '+m[3]+', c\'est environ '+f(g)+' grammes.'},'cuillères'],
['oeufs? (?:a la )?dur',"Un œuf dur cuit environ 9 à 10 minutes dans l'eau bouillante. Passez-le ensuite sous l'eau froide.",'oeuf dur'],
['oeufs? a la coque',"Environ 3 minutes dans l'eau bouillante.",'oeuf coque'],
['oeufs? mollet',"Environ 6 minutes dans l'eau bouillante.",'oeuf mollet'],
['(?:poids|combien pese|taille) (?:d un|d une|de l) oeuf|oeuf (?:moyen )?(?:pese|poids)',"Un œuf moyen pèse environ 55 à 60 grammes, dont à peu près 30 de blanc et 20 de jaune.",'oeuf'],
['cuisson (?:des |de |du )?(?:pates|spaghetti|tagliatelles?|penne|macaronis?)|(?:cuire|cuisent|faire cuire) (?:les |des )?(?:pates|spaghetti)',"En général 8 à 12 minutes dans l'eau bouillante salée. Suivez surtout l'indication du paquet.",'pâtes'],
['(?:sel|saler) (?:l eau|de l eau|pour l eau).*pates|quantite de sel.*(?:eau|pates)',"Environ 10 grammes de sel par litre d'eau.",'sel eau'],
['cuisson (?:du |de |des )?riz|(?:cuire|faire cuire) (?:le |du )?riz',"Riz blanc long : environ 10 à 12 minutes, avec à peu près 2 volumes d'eau pour 1 de riz. Pour le basmati rincé, comptez 1,5 volume d'eau.",'riz'],
['cuisson (?:du |de )?quinoa|(?:cuire|faire cuire) (?:le |du )?quinoa',"Quinoa : 12 à 15 minutes, avec 2 volumes d'eau pour 1 de quinoa.",'quinoa'],
['cuisson (?:des |de )?lentilles',"Lentilles vertes : 20 à 25 minutes. Lentilles corail : 10 à 15 minutes.",'lentilles'],
['cuisson (?:des |de )?pommes? de terre|(?:cuire|faire cuire) (?:les |des )?pommes? de terre',"Entières à l'eau : 20 à 25 minutes selon la taille, en partant d'eau froide salée. Au four à 200 degrés : 45 à 60 minutes.",'pommes de terre'],
['cuisson (?:des |de )?haricots verts',"8 à 12 minutes dans l'eau bouillante salée.",'haricots verts'],
['cuisson (?:du |de )?brocoli',"5 à 8 minutes à l'eau ou à la vapeur.",'brocoli'],
['cuisson (?:des |de )?carottes',"En rondelles : 10 à 15 minutes à l'eau, un peu plus à la vapeur.",'carottes'],
['cuisson (?:du |de )?saumon',"Environ 10 à 15 minutes au four à 180 degrés, ou 3 à 4 minutes par face à la poêle.",'saumon'],
['cuisson (?:du |de )?poulet|(?:cuire|faire cuire|rotir) (?:le |un )?poulet',"Un poulet entier : environ 45 minutes par kilo à 200 degrés. Il est cuit quand la température à cœur atteint 74 degrés.",'poulet'],
['temperature (?:a coeur )?(?:du |de la |de )?(?:poulet|volaille|dinde)',"Volaille : 74 degrés à cœur.",'volaille'],
['(?:cuisson|temperature) (?:du |de la |de )?(?:steak|boeuf|viande rouge)|saignant|a point|bien cuit',"Bœuf à cœur, approximativement : saignant 50 à 52 degrés, à point 54 à 57, bien cuit 65 et plus. Viande hachée : 70 degrés.",'bœuf'],
['cuisson (?:de la |d une )?pizza|pizza (?:au )?four',"Au four le plus chaud possible, 240 à 250 degrés, environ 8 à 12 minutes.",'pizza'],
['repos (?:de la |des |de )?(?:viande|steak|roti)|laisser reposer',"Laissez reposer 5 à 10 minutes pour un steak, 15 à 20 minutes pour un rôti, sous une feuille d'aluminium.",'repos'],
['repos (?:de la |d une )?pate a crepes|pate a crepes.*repos',"Laissez reposer la pâte à crêpes au moins 30 minutes.",'crêpes'],
['(?:combien de temps|conservation|conserver).*(?:restes|plat cuisine)|(?:restes|plat cuisine).*(?:combien de temps|conserver|frigo)',"Les restes cuits se gardent environ 3 jours au réfrigérateur, dans une boîte fermée. Sinon, congelez-les.",'restes'],
['temperature (?:du |de mon )?(?:frigo|refrigerateur|congelateur)',"Le réfrigérateur doit être à 4 degrés maximum, le congélateur à moins 18 degrés.",'frigo'],
['(?:decongeler|decongelation|recongeler)',"Décongelez au réfrigérateur, jamais à température ambiante. Ne recongelez pas un aliment cru déjà décongelé.",'décongélation'],
['noix de beurre',"Une noix de beurre, c'est environ 10 à 20 grammes.",'noix de beurre'],
['(?:une )?pincee',"Une pincée, c'est ce que l'on prend entre le pouce et l'index, moins d'un gramme.",'pincée'],
['bouquet garni',"Un bouquet garni, c'est du thym, du laurier et du persil.",'bouquet garni'],
['remplacer (?:le |du )?beurre',"Vous pouvez utiliser de l'huile, environ les trois quarts de la quantité de beurre.",'substitution'],
['remplacer (?:la |de la )?creme',"Selon la recette, le lait concentré ou le yaourt grec peuvent remplacer la crème.",'substitution'],
['remplacer (?:l |un |des |les )?oeufs?',"Dans un gâteau, un œuf peut se remplacer par une demi-banane écrasée ou environ 60 grammes de compote.",'substitution'],
['remplacer (?:le |du )?lait',"Une boisson végétale convient, en gardant la même quantité.",'substitution'],
['remplacer (?:le |du )?vin',"Utilisez du bouillon avec un peu de vinaigre ou de jus de citron.",'substitution'],
['(?:trop sale|rattraper.*sale|sauce.*sale)',"Ajoutez de l'eau ou du bouillon non salé, un peu de crème, de sucre ou de citron. Une pomme de terre crue dans la sauce peut aussi aider.",'trop salé'],
['(?:trop liquide|sauce.*liquide|epaissir)',"Laissez réduire à feu vif sans couvercle, ou liez avec un peu de maïzena délayée dans de l'eau froide.",'sauce liquide'],
['(?:trop epais|sauce.*epaisse|trop sec)',"Ajoutez un peu d'eau, de bouillon ou de lait en remuant.",'sauce épaisse'],
['(?:viande|boeuf).*(?:dur|coriace)',"Pour une viande à mijoter, une cuisson longue et douce, à couvert, la rend tendre.",'viande dure'],
['(?:ca a brule|brule|attache au fond|fond brule)',"Ne grattez pas le fond : transvasez le contenu dans un autre plat sans toucher à la partie brûlée.",'brûlé'],
['(?:blancs? en neige|monter (?:les )?blancs)',"Utilisez un saladier propre et sec, des œufs à température ambiante et une pincée de sel.",'blancs en neige'],
['(?:fondre|faire fondre) (?:le |du )?chocolat',"Au bain-marie, ou au micro-ondes par tranches de 30 secondes en remuant.",'chocolat'],
['(?:couper|eplucher).*oignons?.*(?:pleurer|larmes?)|oignon.*pleurer',"Mettez l'oignon 15 minutes au congélateur avant de le couper, avec un couteau bien aiguisé.",'oignon']
]);
})();
