Nota (2026-10-24, en curso): mientras el render completo corre (≈2,5 min por oración en esta máquina), los
archivos `narration_es.wav`, `timings_es.json`, `segments_es.json`, `qc_es.json`, `preview_narracion_es.mp3` y
`VOICE_QC_qwen.md` que aparezcan en `smoke/` son una **prueba de tubería** con silencios de 1 s en las oraciones aún
no renderizadas (`QWEN_PARTIAL=1`): no son la entrega. La entrega real se escribe en esta carpeta solo al terminar el
render y pasar el QC (WER 0 en las 127 oraciones, 7:00-8:00, 135-170 ppm por beat). Este archivo se borra entonces.
