THREE.saveGeometryToObj = function (geometry) {
var s = '';
for (i = 0; i < geometry.vertices.length; i++) {
    s+= 'v '+(geometry.vertices[i].x) + ' ' +
    geometry.vertices[i].y + ' '+
    geometry.vertices[i].z + '\n';
}

for (i = 0; i < geometry.faces.length; i++) {

    s+= 'f '+ (geometry.faces[i].a+1) + ' ' +
    (geometry.faces[i].b+1) + ' '+
    (geometry.faces[i].c+1);

    if (geometry.faces[i].d !== undefined) {
        s+= ' '+ (geometry.faces[i].d+1);
    }
    s+= '\n';
}

return s;
}

function saveOBJ( geometry ){
  
  var objString = THREE.saveGeometryToObj( geometry );
  var blob = new Blob([objString], {type: 'text/plain'});
  
  saveAs(blob, 'pixel_printer.obj');
  
}