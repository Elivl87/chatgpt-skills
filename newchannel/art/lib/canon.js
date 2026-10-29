/* Diez Mil Puntos art kit · THE canonical look of Eli and Mila (Producer, design locked 2026-10-29):
   Eli = skin #d9a66c + home outfit 3bB (wine flannel open over a yellow tee, cargo pants) + headwear V2 '1a' (red backwards
   cap, plain #c62a2f, no logo); Mila = outfit 2 (denim jacket over a purple-striped tee, purple skirt over leggings).
   ONE switch: C.CANON below. Every page that loads this file after cast_alts.js + outfits.js + hats_v2.js draws the canonical
   look under the usual ids eli1 / mila1 (so every shot list picks it up). The previous looks stay reachable:
     eli1_taller / mila1_taller = the workshop pair (tee + apron + knit beanie / purple sweater + mustard overalls)
     C.OUTFITS.variant('eli' | 'mila', n) and C.ELI_HATS_V2.variant(key, outfitId) for any other combination.
   Set C.CANON = null (or remove the script tag) to go back to the workshop look everywhere. */
(function (root) {
  const K = root.K, C = K.cast;
  C.CANON = { eli: { outfit: '3bB', hat: '1a' }, mila: { outfit: 2 } };
  C.CANON_COLORS = { eliHat: '#c62a2f', eliHatDark: '#8e1a20', eliTop: '#7a1f2b', eliTee: '#f2c230', milaTop: '#4d6ea6', milaSkirt: '#7158b8' };   // for hand-drawn stand-ins (doodles, top views)
  if (!C.SPECS.eli1_taller) { C.define('eli1_taller', C.SPECS.eli1); C.define('mila1_taller', C.SPECS.mila1); }
  if (!C.CANON || !C.OUTFITS || !C.ELI_HATS_V2) return;
  const E = C.CANON.eli, M = C.CANON.mila;
  const eOut = C.OUTFITS.variant('eli', E.outfit, 0), eId = E.hat ? C.ELI_HATS_V2.variant(E.hat, eOut) : eOut, mId = C.OUTFITS.variant('mila', M.outfit, 0);
  C.define('eli1', Object.assign({}, C.SPECS[eId], { name: 'Eli', canon: `outfit ${E.outfit} + hat ${E.hat}` }));
  C.define('mila1', Object.assign({}, C.SPECS[mId], { name: 'Mila', canon: `outfit ${M.outfit}` }));
})(typeof window !== 'undefined' ? window : globalThis);
