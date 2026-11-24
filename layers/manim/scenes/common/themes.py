"""Temas de color. Cada video puede activar uno con `apply("sepia")`.

El tema remapea los colores base de `sketch.py` en el momento de renderizar,
así que modelos y escenas siguen usando nombres semánticos (INK, RED, ...).
"""
from . import sketch as sk

SEPIA = {
    # tinta principal y lápiz
    sk.INK: "#4E321B",       # sepia oscuro
    sk.PENCIL: "#9A7E58",    # sepia claro (líneas fantasma)
    sk.SHADE: "#7A5634",     # rayado de sombra
    # tintas de acento, apagadas (sanguina, índigo, oliva, ocre)
    sk.RED: "#A3432A",       # sanguina → corriente / polo N
    sk.BLUE: "#3B5B6E",      # índigo grisáceo → campo / polo S
    sk.GREEN: "#4F6B2C",     # oliva → fuerza
    sk.ORANGE: "#B06E1E",    # ocre → giro
    sk.HILITE: "#D9A441",    # aguada ocre
    # rellenos
    sk.FILL: "#DCC7A1",      # papel tostado
    sk.FILL_DARK: "#C4A679", # tostado oscuro
}

# Colores ya "tematizados" para usar directamente (textos, overlays).
SEPIA_NAMED = {
    "ink": SEPIA[sk.INK], "pencil": SEPIA[sk.PENCIL], "red": SEPIA[sk.RED],
    "blue": SEPIA[sk.BLUE], "green": SEPIA[sk.GREEN], "orange": SEPIA[sk.ORANGE],
    "hilite": SEPIA[sk.HILITE], "fill": SEPIA[sk.FILL], "fill_dark": SEPIA[sk.FILL_DARK],
}


def apply(name: str):
    if name == "sepia":
        sk.set_style(SEPIA, double=1.0, double_min_width=3.2)
    else:
        sk.set_style({}, double=0.0)
