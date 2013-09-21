
// Module Configuration
    var moduleEditor  = 'weeZeel weeDoc Converter';
    var moduleVersion = 0;

// Export Module
    this.createWeeDoc = function( config, content, page ){

        var result = '<!DOCTYPE html>';

        // Document headers
        result += '<html>';
        result += '<head>';
        result += '<title>' + ( config.title || '' ) + '</title>'
        result += '<meta name="application-name" content="weeDoc">';
        result += '<meta name="description" content="version:' + moduleVersion + '">';
        result += '<meta name="description" content="creationDate:' + ( ( new Date( config.creationDate ) ).getTime() || Date.now() ) + '">';
        result += '<meta name="description" content="modificationDate:' + ( ( new Date( config.modificationDate ) ).getTime() || Date.now() ) + '">';
        result += '<meta name="author" content="' + ( config.author || '' ) + '">';
        result += '<meta name="generator" content="' + moduleEditor + '">';
        result += '<meta charset="UTF-8">'
        result += '</head>';
        result += '<body>';

        // Content
        result += '<section id="content">';
        result += content;
        result += '</section>'

        // Page
        result += '<section id="page">';
        result += '<article data-page-type="all" style="';

        var i = 0;

        for( var j in page ){
            result += ( i++ ? '; ' : '' ) + j + ': ' + page[ j ];
        }

        result += '"></article>'
        result += '</section>';

        // Style
        result += '<section id="style">';
        // To Do -> Style
        result += '</section>';

        // Script
        result += '<section id="script">';
        // To Do -> Script
        result += '</section>';

        // Closing tags
        result += '</body>';
        result += '</html>';

        return result;

    };
