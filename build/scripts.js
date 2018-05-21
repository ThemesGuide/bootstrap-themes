
    /* simple scripts file for Themes.guide Bootstrap 4 theme templates */

    // init Bootstrap tooltips & popovers
    $("[data-toggle=popover]").popover();
    $("[data-toggle=tooltip]").tooltip();
    
    
    /* copy demo sources to clipboard */
    function copyTextToClipboard(text) {
      var textArea = document.createElement("textarea");
      textArea.style.position = 'fixed';
      textArea.style.top = 0;
      textArea.style.left = 0;
      textArea.style.width = '2em';
      textArea.style.height = '2em';
      textArea.style.padding = 0;
      textArea.style.border = 'none';
      textArea.style.outline = 'none';
      textArea.style.boxShadow = 'none';
      textArea.style.background = 'transparent';
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
    
      try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        console.log('Copying text command was ' + msg);
      } catch (err) {
        console.log('Oops, unable to copy');
      }
    
      document.body.removeChild(textArea);
      return false;
    }
    
    $('main').find('.card, .btn-group, .btn, .navbar, .modal, .form-group, .alert, .progress, .table-responsive, .jumbotron').each(function(){
        var $this = $(this);
        var content = $this.get(0).outerHTML;
        var title = "Click to copy source";
        
        $this.addClass("copyable");
        $this.tooltip({
            title: title,
            placement: 'right',
            trigger: 'hover'
        });
        
        $this.on('show.bs.tooltip', function(e) {
            if ($this.find('.card, .btn-group, .btn, .form-group, .alert, .progress').length>0) {
                $this.tooltip('hide');
            }
        });
        
        $this.click(function(e){
            e.stopPropagation();
            e.preventDefault();
            $this.tooltip('dispose');
            $this.tooltip({
                title: "Copied!",
                fallbackPlacement:"clockwise",
                placement: 'right',
                trigger: 'hover'
            });
            $this.tooltip('show');
            copyTextToClipboard(content);
        }).mouseleave(function(){
            $this.tooltip('dispose');
            $this.tooltip({title:title, placement: 'right', trigger: 'hover'});
        });
    });