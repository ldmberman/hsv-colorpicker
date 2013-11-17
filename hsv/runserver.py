# -*- coding: utf-8 -*-

import os
from flask import Flask, render_template, Markup

app = Flask(__name__)

STATIC_ROOT = 'static'

@app.route('/')
def index():
    vertex_shader_file = os.path.join(STATIC_ROOT, 'shaders/hsv_vertex.shader')
    fragment_shader_file = os.path.join(STATIC_ROOT,
            'shaders/hsv_fragment.shader')
    with open(vertex_shader_file) as vsf:
        vertex_shader_source = Markup(vsf.read())
    with open(fragment_shader_file) as fsf:
        fragment_shader_source = Markup(fsf.read())
    return render_template('hsv.html',
            STATIC_ROOT=STATIC_ROOT,
            vertex_shader_source=vertex_shader_source,
            fragment_shader_source=fragment_shader_source)


if __name__ == '__main__':
    app.run()
