/**
 * broccoli-sass-font-face
 * © 2014 Daniil Filippov <filippovdaniil@gmail.com>
 * MIT License <https://github.com/filippovdaniil/broccoli-sass-font-face/blob/master/LICENSE>
 */

var fs = require( 'fs' );
var path = require( 'path' );
var mkdirp = require( 'mkdirp' );
var writer = require( 'broccoli-caching-writer' );
var ttf_family = require( './lib/ttf_family.js' );

module.exports = FontUtil;
FontUtil.prototype = Object.create( writer.prototype );
FontUtil.prototype.constructor = FontUtil;
FontUtil.prototype.font_root = null;
FontUtil.prototype.font_dir = null;
FontUtil.prototype.include = false;

FontUtil.prototype.ext2format = {
    ttf: 'truetype',
    eot: 'embedded-opentype',
    woff: 'woff',
    woff2: 'woff2',
};

function FontUtil( tree, options ){
    if( ! ( this instanceof FontUtil ) ) 
        return new FontUtil( tree, options )

    writer.apply( this, arguments );

    this.tree = tree;
    options = options || {};
    if( ! options.output )
        throw new Error( 'Missed required option "output"' );

    for( var key in FontUtil )
        if( FontUtil.hasOwnProperty( key ) )
            this[ key ] = FontUtil[ key ];
    for( var key in options )
        if( options.hasOwnProperty( key ) )
            this[ key ] = options[ key ];

    if( typeof this.tree === 'object' && ! this.font_dir )
        throw new Error( 'Missed required "font_dir" option' );

    this.font_dir = this.font_dir ? this.font_dir : this.tree;
    this.url = this.font_dir += this.font_dir.slice( -1 ) === '/' ? '' : '/';
    if( this.font_root )
        this.url = this.url.replace( new RegExp( '^' + this.font_root ), '' );
}


FontUtil.prototype._getFontFamily = function( font_path, ext ){
    if( ext !== 'ttf' )
        return null;
    var data = fs.readFileSync( font_path );
    return ttf_family( data );
};


FontUtil.prototype._scss = function(){
    var files = fs.readdirSync( this.font_dir ),
        fonts = [];
    files.map(function( font ){
        var ext = path.extname( font ),
            ext_l = ext.slice( 1 ).toLowerCase();
        if( ! this.ext2format[ ext_l ] )
            return;
        var name = path.basename( font, ext ),
            family = this._getFontFamily( this.font_dir + font, ext_l );
        if( ! fonts[ name ] )
            fonts[ name ] = { files: [] };
        if( ext_l !== 'eot' )
            fonts[ name ].files.push( [ font, ext_l ] );
        else
            fonts[ name ].eot = font;
        if( family )
            fonts[ name ].family = family;
    }, this );

    var output = '\n',
        s = '    ';
    for( var name in fonts ){
        var family = fonts[ name ].family || name;
        output += '\n';
        output += '@mixin ' + name + '_font{\n';
        output += s + '@font-face{\n';
        output += s + s + 'font-family: "' + family + '";\n';

        if( fonts[ name ].eot ){
            var url = this.url + fonts[ name ].eot;
            output += s + s + 'src: url(\'' + url + '\');\n';
            output += s + s + 'src: url(\'' + url + '?#iefix\') format(\'' + this.ext2format.eot + '\')';
            output += fonts[ name ].files.length ? ',\n' : ';\n';
        }else
            output += s + s + 'src:';
        for( var i = 0; i < fonts[ name ].files.length; i++ ){
            var font = fonts[ name ].files[ i ],
                url = this.url + font[ 0 ],
                ext = font[ 1 ];
            output += ( ! fonts[ name ].eot && i === 0 ? '' : s + s + s ) + ' url(\'' + url + '\') ';
            output += 'format(\'' + this.ext2format[ ext ] + '\')';
            output += i + 1 === fonts[ name ].files.length ? ';\n' : ',\n';
        }
        output += s + s + 'font-weight: normal;\n';
        output += s + s + 'font-style: normal;\n';
        output += s + '}\n';
        output += '}\n';
        if( this.include )
            output += '@include ' + name + '_font;\n';
        output += '$' + name + '_font_family: "' + family + '";\n';
    }
    return output;
};


FontUtil.prototype.updateCache = function( src, dst ){
    var scss_output = '// File created with broccoli-sass-font-face at ' + new Date() + '\n';
    scss_output += this._scss();
    mkdirp.sync( path.join( dst, path.dirname( this.output ) ) );
    fs.writeFileSync( path.join( dst, this.output ), scss_output, 'utf8' );
};
