from flask import Flask, render_template, request, flash, Response, url_for, send_from_directory, redirect
from werkzeug.utils import secure_filename
import json
from flask import jsonify
import re
from os.path import join, dirname, realpath
import numpy as np
import pandas as pd
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans

app = Flask(__name__)
log = app.logger

full_file_name = ''
components = []

@app.route('/')
def index_page(name=None):
            
    return render_template('index.html', name=name)

@app.route('/index')
def index_page2(name=None):

    return render_template('index.html', name=name)

@app.route('/task2')
def index_task2(name=None):

    return render_template('index2.html', name=name)

@app.route('/save_file', methods=['POST', 'GET'])
def save():
    if (request.method == 'GET'):
        return 'Invalid request'
    
    if ('file' not in request.files):
        flash('No File Part')
        return redirect(request.url)
    
    global full_file_name

    file_folder = './uploads/'
    f = request.files['file']
    fname = secure_filename(f.filename)
    if fname.split('.')[-1] != 'csv':
            return Response('The file suffix must be .csv', status=500)
    full_file_name = file_folder + fname
    f.save(full_file_name)

    eigenvalues, coors, axes = do_pca(full_file_name)
    resp = json.dumps({'eigenvalues': eigenvalues, 'coors':coors, 'axes':axes})
    return Response(resp, status=200)

@app.route('/retrieve_attrs', methods=['POST', 'GET'])
def retrieve():
    if (request.method == 'GET'):
        return 'Invalid request'
    
    frame = pd.read_csv(full_file_name)
    frame.drop(['name', 'Total', 'Generation'], axis=1, inplace=True)
    lsttypes = []
    for i in frame.columns:
        if(type(frame[i].iloc[0]) is str):
            continue
        else:
            lsttypes.append(i)
    rt_attr = {'axes': components.tolist(), 'attrs': lsttypes}
    
    return jsonify(rt_attr)

@app.route('/retrieve_scatter_coors', methods=['POST', 'GET'])
def scatters():
    if (request.method == 'GET'):
        return 'Invalid request'
    
    attrs = json.loads(request.get_data())
    frame = pd.read_csv(full_file_name)
    
    val_attrs = []
    data = {}
    for attr in attrs:
        val_attrs.append(attr['attr'])
    frame = frame[val_attrs]
    data = frame.to_dict()
    for col in data:
        data[col] = list(data[col].values())
    return jsonify(data)

@app.route('/cluster', methods=['POST','GET'])
def cluster():
    if (request.method == 'GET'):
        return 'Invalid request'
    frame = pd.read_csv(full_file_name)
    frame.drop(['name', 'Total', 'Generation'], axis=1, inplace=True)
    frame['Legendary'] = frame['Legendary'].apply(lambda x: int(x))
    lsttypes = []
    for i in frame.columns:
        if(type(frame[i].iloc[0]) is str):
            continue
        else:
            lsttypes.append(i)
    frame = frame[lsttypes]
    kmeans = KMeans(n_clusters=9, random_state=0).fit(frame.values)
    print(kmeans_estimate(frame, kmeans))
    return jsonify(kmeans.labels_.tolist())

def do_pca(file_path):
    global components

    frame = pd.read_csv(file_path)
    frame.drop(['name', 'Total', 'Generation'], axis=1, inplace=True)
    frame['Legendary'] = frame['Legendary'].apply(lambda x: int(x))
    lsttypes = []
    for i in frame.columns:
        if(type(frame[i].iloc[0]) is str):
            continue
        else:
            lsttypes.append(i)
    nframe = frame[lsttypes]
    pca = PCA()
    pca.fit(nframe.values)
    components = pca.components_
    compos = components[:2]
    coors = scatter_biplot(nframe, compos)
    axes = get_axis(compos.tolist(), [0,1])
    
    return pca.explained_variance_ratio_.tolist(), coors, axes

def get_axis(compos, idx):
    axes = []
    for i in range(len(compos[0])):
        oneDim = []
        for j in idx:
            oneDim.append(compos[j][i])
        axes.append(oneDim)
    return axes

def scatter_biplot(frame, compo):
    coors = []
    for _, row in frame.iterrows():
        oneDim = []
        for i in range(len(compo)):
            oneDim.append((row.values*compo[i]).sum())
        coors.append(oneDim)
    return coors

def kmeans_estimate(frame, kmeans):
    frame['label'] = kmeans.labels_
    centers = kmeans.cluster_centers_
    num_centroid = len(centers)
    mse = 0
    for i in range(num_centroid):
        subframe = frame[frame['label'] == i]
        subframe.drop(['label'], axis=1, inplace=True)
        center = centers[i]
        for j in range(len(subframe)):
            mse = ((subframe.iloc[j] - center)**2).sum()
    return mse
"""
mse = [1657.5877062541135,
 1510.65644911724,
 1845.56177662037,
 6503.686854338842,
 1590.3432946865898,
 1685.3033844655472,
 4105.28185595568,
 514.1150519031144,
 2658.4861111111104]
"""

if (__name__=='__main__'):
    app.run(host='0.0.0.0')