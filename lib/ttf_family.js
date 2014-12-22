/**
 * broccoli-sass-font-face
 * © 2014 Daniil Filippov <filippovdaniil@gmail.com>
 * MIT License <https://github.com/filippovdaniil/broccoli-sass-font-face/blob/master/LICENSE>
 */


const TABLE_COUNT_POS = 4,
      TABLE_HEAD_POS = 12,
      TABLE_HEAD_SIZE = 16,
      CONTENTS_POS = 8,
      CONTENTS_SIZE = 4;

exports.get_info = function( data, store_pos, pos ){
    var field_pos = data.readUInt16BE( pos + 10 );
        field = '';

    for( var i = 0; i < data.readUInt16BE( pos + 8 ); i++ ){
        var code = data[ store_pos + field_pos + i ];
        if( code === 0 )
            continue;
        field += String.fromCharCode( code );
    }
    return field;
}

module.exports = function( data ){
    var tables_num = data.readUInt16BE( TABLE_COUNT_POS );
    for( var i = 0; i < tables_num; ++i ){
        var pos = TABLE_HEAD_POS + i * TABLE_HEAD_SIZE,
            tag = data.slice( pos, pos + CONTENTS_SIZE ).toString();

        if( tag === 'name' ){
            pos = data.readUInt32BE( pos + CONTENTS_POS );
            break;
        }
    }

    var store_pos = data.readUInt16BE( pos + 4 ) + pos,
        family = exports.get_info( data, store_pos, pos + 6 + 12 ),
        subfamily = exports.get_info( data, store_pos, pos + 6 + 24 );
    return family + ' ' + subfamily;
}
