/* GALERIE DU GUIDE — gabarit neutre (site/assets/galerie.js) : la liste des médias de l'étude de cas.
   Format : window.GuideGalerie = [{ f, t, s }, …]
     f : nom du fichier dans media/ du site, tel que build_presentation.py l'écrit (<nom>.jpg pour une image, <nom>.mp4) ;
     t : titre affiché ;  s : section (sert aux filtres).
   La vignette est lue dans media/vignettes/<nom>.jpg : build_site.py la fabrique, pour les images comme pour les vidéos.

   REMPLISSAGE AUTOMATIQUE : tant que la ligne ci-dessous porte le marqueur « @auto », python tools/build_site.py
   remplace ce fichier, dans le site assemblé seulement, par la liste lue dans presentation.json (les planches présentes
   dans livrables/presentation/media, dans l'ordre). La section vient du 4e élément d'une planche s'il existe
   (["plates/01-x.png", "01-x", "Titre", "Section"]), sinon « Images » ou « Vidéos ».
   Pour écrire la liste à la main (sections, titres plus courts), retirer le marqueur et remplir le tableau. */
window.GuideGalerie = []; // @auto
