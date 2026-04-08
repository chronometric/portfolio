/**
 * Loads site copy from data/resume.json (JSON is easy to edit and validate).
 * Runs after main.js so carousels / shuffle can be rebuilt with your data.
 */
(function ($) {
  'use strict';

  var RESUME_URL = 'data/resume.json';

  function esc(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function applyHeading($h3, heading) {
    if (!$h3.length || !heading) return;
    var before = heading.before != null ? heading.before : '';
    var hi = heading.highlight != null ? heading.highlight : '';
    $h3.html(esc(before) + (hi ? '<span>' + esc(hi) + '</span>' : ''));
  }

  function initTextRotation(titles) {
    var $c = $('.text-rotation');
    if (!$c.length) return;
    if ($c.data('owl.carousel')) {
      $c.trigger('destroy.owl.carousel');
    }
    $c.removeClass('owl-loaded owl-drag owl-grab');
    $c.empty();
    (titles || []).forEach(function (t) {
      $c.append(
        $('<div class="item"></div>').append(
          $('<div class="sp-subtitle"></div>').text(t)
        )
      );
    });
    $c.owlCarousel({
      loop: true,
      dots: false,
      nav: false,
      margin: 0,
      items: 1,
      autoplay: true,
      autoplayHoverPause: false,
      autoplayTimeout: 3800,
      animateOut: 'animated-section-scaleDown',
      animateIn: 'animated-section-scaleUp'
    });
  }

  function buildPortfolioFigure(p) {
    var groups = p.groups || [];
    var $fig = $('<figure class="item"></figure>')
      .addClass(p.itemClass || 'standard')
      .attr('data-groups', JSON.stringify(groups));

    var $imgWrap = $('<div class="portfolio-item-img"></div>');
    var $img = $('<img loading="lazy" decoding="async" />')
      .attr('src', p.image || '')
      .attr('alt', p.imageAlt || '');
    $imgWrap.append($img);
    if (p.link) {
      var $a = $('<a></a>')
        .attr('href', p.link)
        .attr('target', '_blank');
      if (p.linkTitle) $a.attr('title', p.linkTitle);
      $imgWrap.append($a);
    }
    $fig.append($imgWrap);
    if (p.extraIconClass) {
      $fig.append($('<i></i>').addClass(p.extraIconClass));
    }
    $fig.append($('<h4 class="name"></h4>').text(p.name || ''));
    $fig.append($('<span class="category"></span>').text(p.category || ''));
    return $fig;
  }

  function refreshPortfolio(items) {
    var $grid = $('.portfolio-grid');
    if (!$grid.length || !items || !items.length) return;
    try {
      if ($grid.data('shuffle')) {
        $grid.shuffle('destroy');
      }
    } catch (e) { /* not initialized */ }
    $grid.empty();
    items.forEach(function (p) {
      $grid.append(buildPortfolioFigure(p));
    });
    $grid.imagesLoaded(function () {
      $grid.shuffle({
        speed: 450,
        itemSelector: 'figure'
      });
    });
  }

  function applyResume(data) {
    var site = data.site || {};
    var person = data.person || {};
    var about = data.about || {};
    var resume = data.resume || {};
    var contact = data.contact || {};

    if (site.title) document.title = site.title;
    if (site.metaDescription) {
      $('meta[name="description"]').attr('content', site.metaDescription);
    }
    if (site.metaKeywords) {
      $('meta[name="keywords"]').attr('content', site.metaKeywords);
    }
    if (site.themeColor) {
      $('meta[name="theme-color"]').attr('content', site.themeColor);
    }
    if (site.author) {
      $('meta[name="author"]').attr('content', site.author);
    }

    if (person.name) {
      $('#site_header .header-titles h2, .start-page .title-block h2').text(person.name);
    }
    var $hdrH4 = $('#site_header .header-titles h4');
    if ($hdrH4.length >= 2) {
      if (person.headerSubtitle1 != null) $($hdrH4[0]).text(person.headerSubtitle1);
      if (person.headerSubtitle2 != null) $($hdrH4[1]).text(person.headerSubtitle2);
    }
    if (person.photoSrc) {
      $('#site_header .header-photo img').attr('src', person.photoSrc);
    }
    if (person.photoAlt != null) {
      $('#site_header .header-photo img').attr('alt', person.photoAlt);
    }
    if (person.cvUrl) {
      $('.header-buttons .btn-primary').attr('href', person.cvUrl);
    }
    if (person.cvButtonLabel) {
      $('.header-buttons .btn-primary').text(person.cvButtonLabel);
    }
    if (person.copyrightYear != null) {
      $('.copyrights').text('© ' + person.copyrightYear + ' All rights reserved.');
    }

    if (data.home && data.home.rotatingTitles && data.home.rotatingTitles.length) {
      initTextRotation(data.home.rotatingTitles);
    }

    var $summary = $('#about-summary');
    if ($summary.length && about.summaryParagraphs) {
      $summary.empty();
      about.summaryParagraphs.forEach(function (p) {
        $summary.append($('<p></p>').text(p));
      });
    }

    var $infoList = $('#about-contact-list');
    if ($infoList.length && about.contactFields) {
      $infoList.empty();
      about.contactFields.forEach(function (f) {
        $infoList.append(
          $('<li></li>')
            .append($('<span class="title"></span>').text(f.label || ''))
            .append($('<span class="value"></span>').text(f.value || ''))
        );
      });
    }

    var $services = $('#about-services');
    if ($services.length && about.services) {
      $services.empty();
      var row = $('<div class="row"></div>');
      var left = $('<div class="col-xs-12 col-sm-6"><div class="col-inner"><div class="info-list-w-icon"></div></div></div>');
      var right = $('<div class="col-xs-12 col-sm-6"><div class="col-inner"><div class="info-list-w-icon"></div></div></div>');
      var $leftInner = left.find('.info-list-w-icon');
      var $rightInner = right.find('.info-list-w-icon');
      about.services.forEach(function (s, i) {
        var $block = $('<div class="info-block-w-icon"></div>');
        $block.append(
          $('<div class="ci-icon"></div>').append(
            $('<i></i>').addClass(s.iconClass || 'lnr lnr-star')
          )
        );
        $block.append(
          $('<div class="ci-text"></div>')
            .append($('<h4></h4>').text(s.title || ''))
            .append($('<p></p>').text(s.text || ''))
        );
        if (i < 2) $leftInner.append($block);
        else $rightInner.append($block);
      });
      row.append(left, right);
      $services.append(row);
    }

    var $facts = $('#about-fun-facts');
    if ($facts.length && about.funFacts) {
      $facts.empty();
      about.funFacts.forEach(function (f) {
        var $col = $('<div class="col-xs-12 col-sm-4"></div>');
        var $ff = $('<div class="fun-fact gray-default"></div>');
        $ff.append($('<i></i>').addClass(f.iconClass || 'lnr lnr-star'));
        $ff.append($('<h4></h4>').text(f.title || ''));
        $ff.append($('<span class="fun-fact-block-value"></span>').text(f.value != null ? String(f.value) : ''));
        $ff.append($('<span class="fun-fact-block-text"></span>'));
        $col.append($ff);
        $facts.append($col);
      });
    }

    var $uni = $('#university');
    if ($uni.length && resume.education) {
      $uni.empty();
      resume.education.forEach(function (u) {
        $uni.append(
          $('<div class="timeline-item clearfix"></div>')
            .append(
              $('<div class="left-part"></div>')
                .append($('<h5 class="item-period"></h5>').text(u.period || ''))
                .append($('<span class="item-company"></span>').text(u.institution || ''))
            )
            .append($('<div class="divider"></div>'))
            .append(
              $('<div class="right-part"></div>').append(
                $('<h4 class="item-title"></h4>').text(u.degree || '')
              )
            )
        );
      });
    }

    var $exp = $('#experience');
    if ($exp.length && resume.experience) {
      $exp.empty();
      resume.experience.forEach(function (x) {
        var $right = $('<div class="right-part"></div>').append(
          $('<h4 class="item-title"></h4>').text(x.title || '')
        );
        (x.paragraphs || []).forEach(function (p) {
          $right.append($('<p></p>').text(p));
        });
        $exp.append(
          $('<div class="timeline-item clearfix"></div>')
            .append(
              $('<div class="left-part"></div>')
                .append($('<h5 class="item-period"></h5>').text(x.period || ''))
                .append($('<span class="item-company"></span>').text(x.company || ''))
            )
            .append($('<div class="divider"></div>'))
            .append($right)
        );
      });
    }

    applyHeading($('#resume-skills-platform-heading'), resume.skillsPlatformHeading);

    var $plat = $('#resume-skills-platform');
    if ($plat.length && resume.skillsPlatform) {
      $plat.empty();
      resume.skillsPlatform.forEach(function (sk) {
        var bar = Math.min(9, Math.max(1, parseInt(sk.bar, 10) || 1));
        var pct = sk.percent != null ? String(sk.percent) : '0';
        $plat.append(
          $('<div class="skill clearfix"></div>')
            .append($('<h4></h4>').text(sk.name || ''))
            .append($('<div class="skill-value"></div>').text(pct + '%'))
        );
        $plat.append(
          $('<div class="skill-container"></div>')
            .addClass('skill-' + bar)
            .append($('<div class="skill-percentage"></div>'))
        );
      });
    }

    applyHeading($('#resume-skills-coding-heading'), resume.skillsCodingHeading);

    var $code = $('#resume-skills-coding');
    if ($code.length && resume.skillsCoding) {
      $code.empty();
      resume.skillsCoding.forEach(function (sk) {
        var bar = Math.min(9, Math.max(1, parseInt(sk.bar, 10) || 1));
        var pct = sk.percent != null ? String(sk.percent) : '0';
        $code.append(
          $('<div class="skill clearfix"></div>')
            .append($('<h4></h4>').text(sk.name || ''))
            .append($('<div class="skill-value"></div>').text(pct + '%'))
        );
        $code.append(
          $('<div class="skill-container"></div>')
            .addClass('skill-' + bar)
            .append($('<div class="skill-percentage"></div>'))
        );
      });
    }

    var $know = $('#resume-knowledges');
    if ($know.length && resume.knowledges) {
      $know.empty();
      resume.knowledges.forEach(function (k) {
        $know.append($('<li></li>').text(k));
      });
    }

    var $contactCol = $('#contact-info-blocks');
    if ($contactCol.length && contact.blocks) {
      $contactCol.empty();
      contact.blocks.forEach(function (b) {
        $contactCol.append(
          $('<div class="lm-info-block gray-default"></div>')
            .append($('<i></i>').addClass(b.iconClass || 'lnr lnr-envelope'))
            .append($('<h4></h4>').text(b.line || ''))
            .append($('<span class="lm-info-block-value"></span>'))
            .append($('<span class="lm-info-block-text"></span>'))
        );
      });
    }

    if (contact.formHeading != null) {
      var $fh = $('#contact-form-heading');
      var span = contact.formHeadingSpan;
      if (span) {
        $fh.html(esc(contact.formHeading) + ' <span>' + esc(span) + '</span>');
      } else {
        $fh.text(contact.formHeading);
      }
    }

    if (data.portfolio && data.portfolio.length) {
      function runPortfolio() {
        setTimeout(function () {
          refreshPortfolio(data.portfolio);
        }, 0);
      }
      if (document.readyState === 'complete') {
        runPortfolio();
      } else {
        $(window).one('load', runPortfolio);
      }
    }
  }

  function loadResumeJson() {
    fetch(RESUME_URL, { cache: 'no-store' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(applyResume)
      .catch(function (err) {
        console.error('resume.json:', err);
      });
  }

  $(loadResumeJson);
})(jQuery);
