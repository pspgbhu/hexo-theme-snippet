/*!========================================================================
 *  hexo-theme-snippet: app.js v1.0.0
 * ======================================================================== */

window.Utils = {
  getStyle(obj, attr) {
    if (obj.currentStyle) { // currentStyle是针对ie浏览器
      return obj.currentStyle[attr];
    } else {
      return getComputedStyle(obj, false)[attr]; // 针对火狐浏览器
    }
  }
}


;(function () {
  var
    $body = document.body,
    $mnav = document.getElementById("mnav"), //获取导航三角图标
    $mainMenu = document.getElementById("main-menu"), //手机导航
    $process = document.getElementById('process'), //进度条
    $ajaxImgs = document.querySelectorAll('.img-ajax'), //图片懒加载
    $commentsCounter = document.getElementById('comments-count'),
    $gitcomment = document.getElementById("gitcomment"),
    $backToTop = document.getElementById("back-to-top"),
    timer = null;

  //手机菜单导航
  $mnav.onclick = function () {
    var navOpen = $mainMenu.getAttribute("class");
    if (navOpen.indexOf("in") != '-1') {
      $mainMenu.setAttribute("class", "collapse navbar-collapse");
    } else {
      $mainMenu.setAttribute("class", "collapse navbar-collapse in");
    }
  };

  //设备判断
  var isPC = true;
  (function (designPercent) {
    function params(u, p) {
      var m = new RegExp("(?:&|/?)" + p + "=([^&$]+)").exec(u);
      return m ? m[1] : '';
    }
    if (/iphone|ios|android|ipod/i.test(navigator.userAgent.toLowerCase()) == true && params(location.search, "from") != "mobile") {
      var mainWidth = document.body.clientWidth;
      var fontSize = mainWidth / designPercent + 'px';
      document.documentElement.style.fontSize = fontSize;
      window.onresize = function () {
        var mainWidth = document.body.clientWidth;
        fontSize = mainWidth / designPercent + 'px';
        document.documentElement.style.fontSize = fontSize;
      };
      isPC = false;
    } else {
      document.documentElement.style.fontSize = '610%'
    };
  })(450 / 100);

  //首页文章图片懒加载
  function imgsAjax($targetEles) {
    if (!$targetEles) return;
    var _length = $targetEles.length;
    if (_length > 0) {
      var scrollBottom = getScrollTop() + window.innerHeight;
      for (var i = 0; i < _length; i++) {
        (function (index) {
          var $this = $targetEles[index];
          var $this_offsetZero = $this.getBoundingClientRect().top + window.pageYOffset - document.documentElement.clientTop;
          if (scrollBottom >= $this_offsetZero && $this.getAttribute('data-src') && $this.getAttribute('data-src').length > 0) {
            if ($this.nodeName.toLowerCase() === 'img') {
              $this.src = $this.getAttribute('data-src');
              $this.style.display = 'block';
            } else {
              var imgObj = new Image();
              imgObj.onload = function () {
                $this.innerHTML = "";
              };
              imgObj.src = $this.getAttribute('data-src');
              $this.style.backgroundImage = "url(" + $this.getAttribute('data-src') + ")";
            }
            $this.removeAttribute('data-src'); //为了优化，移除
          }
        })(i);
      }
    }
  }

  //获取滚动高度
  function getScrollTop() {
    return ($body.scrollTop || document.documentElement.scrollTop);
  }

  //滚动回调
  var scrollCallback = function () {
    // if ($process) {
    //   $process.style.width = (getScrollTop() / ($body.scrollHeight - window.innerHeight)) * 100 + "%";
    // }
    (isPC && getScrollTop() >= 300) ? $backToTop.removeAttribute("class", "hide") : $backToTop.setAttribute("class", "hide");
    imgsAjax($ajaxImgs);
  };
  scrollCallback();

  //监听滚动事件
  window.addEventListener('scroll', function () {
    clearTimeout(timer);
    timer = setTimeout(function fn() {
      scrollCallback();
    }, 200);
  }, { passive: true });

  // 安装功能插件
  loadFeatures(
    backToTop,  // 返回顶部
    toc,        // 吸顶目录
  );

  //返回顶部
  function backToTop() {
    var f = {};
    f.init = function () {
      $backToTop.onclick = function () {
        cancelAnimationFrame(timer);
        timer = requestAnimationFrame(function fn() {
          var sTop = getScrollTop();
          if (sTop > 0) {
            $body.scrollTop = document.documentElement.scrollTop = sTop - 200;
            timer = requestAnimationFrame(fn);
          } else {
            cancelAnimationFrame(timer);
          }
        });
      };
    }
    return f;
  }

  /**
   * 书签吸顶功能
   */
  function toc() {
    var f = {
      MIN_WIDTH: 992,
      isFloating: false,
      width: '200px',
      $el: document.querySelector('.toc-floating'),
      top: 999999,
      inited: false,
      active: false,
    };

    f.init = function () {
      if (!this.$el) return;

      if (!this.inited) {
        this.bindResize();
      }

      if (window.innerWidth <= this.MIN_WIDTH) return;

      this.top = this.$el.offsetTop + document.querySelector('.sidebar').offsetTop;
      this.width = window.Utils.getStyle(this.$el, 'width');
      this.$el.style.width = this.width;
      this.bindEvent();

      this.inited = true;
      this.active = true;
    };

    f.bindEvent = function () {
      var that = this;
      var timer = null;
      this.scrollHandler = this.scrollHandler.bind(this);
      window.addEventListener('scroll', this.scrollHandler, { passive: true });
    };

    f.unbindEvent = function () {
      this.unsetFloating();
      window.removeEventListener('scroll', this.scrollHandler, { passive: true });
    };

    f.scrollHandler = function (e) {
      const top = window.scrollY;
      if ((top <= this.top && !this.isFloating)
        || (top > this.top && this.isFloating)
      ) { return };

      if (!this.isFloating && top > this.top) { this.setFloating() }
      if (this.isFloating && top <= this.top) { this.unsetFloating() }
    };

    f.setFloating = function () {
      this.isFloating = true;
      this.$el.classList.add('toc-floating-on');
    };

    f.unsetFloating = function () {
      this.isFloating = false;
      this.$el.classList.remove('toc-floating-on');
    };

    f.bindResize = function () {
      var timer = null;
      var that = this;
      window.addEventListener('resize', function () {
        clearTimeout(timer);
        timer = setTimeout(function () {
          if (window.innerWidth <= that.MIN_WIDTH && that.inited) {
            that.unbindEvent();
            that.active = false;
          } else if (!that.active) {
            that.init();
          }
        }, 200);
      });
    };

    return f;
  }


  /**
   * 加载多个附加功能插件
   * 需要插件提供 init 方法
   */
  function loadFeatures() {
    var fns = Array.prototype.slice.call(arguments);
    for (var i = 0; i < fns.length; i += 1) {
      if (typeof fns[i] !== 'function') {
        console.error('loadFeatures only accept function type as a param!\n but accpet:', fns[i]);
        return;
      }
      var feature = fns[i]();
      if (typeof feature.init !== 'function') {
        console.error('No init method in feature function');
      }
      feature.init();
    }
  }

}());
