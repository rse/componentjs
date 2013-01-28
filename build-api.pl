##
##  ComponentJS -- Component System for JavaScript <http://componentjs.com>
##  Copyright (c) 2009-2013 Ralf S. Engelschall <http://engelschall.com>
##
##  This Source Code Form is subject to the terms of the Mozilla Public
##  License, v. 2.0. If a copy of the MPL was not distributed with this
##  file, You can obtain one at http://mozilla.org/MPL/2.0/.
##

use IO::All;

#   command-line arguments
my ($filename_txt, $filename_tmpl, $filename_html) = @ARGV;

#   read textual description and template
my $txt  < io($filename_txt);
my $tmpl < io($filename_tmpl);

#   start generating
my $html_spec = "";
my $html_navi = "";

#   duplication removal cache
my $cache = {};
my $defined = {};

#   remove comments
$txt =~ s/^#.*$//mg;

#   parse first-level structure
$txt =~ s/(?<=\n)([A-Z][^\n]+)\n---+[ \t]*\n(.+?\n)(?=[A-Z][^\n]+?\n---+[ \t]*\n|$)/parse2($1, $2), ''/sge;

sub parse2 {
    my ($title, $body) = @_;

    $html_spec .= "<h2>" . mklink(1, $title) . "</h2>\n";
    $html_navi .= "<h2>" . mklink(0, $title) . "</h2>\n";
    $html_navi .= "<ul>\n";

    #   parse third-level structure
    $body =~ s/^(.+?\n)(?=\n-[ \t]+\S+)/$html_spec .= "<div class=\"intro\">" . addpara(conv(0, $1)) . "<\/div>", ''/se;
    sub addpara {
        my ($txt) = @_;
        $txt =~ s/\n{2,}/<p\/>\n/sg;
        return $txt;
    }
    $body =~ s/(?<=\n)-[ \t]+(\S+.+?)(?=-[ \t]+\S+|$)/parse3($title, $1), ''/sge;

    $html_navi .= "</ul>\n";
}

sub parse3 {
    my ($title, $body) = @_;

    #   parse forth-level structure
    $html_spec .= "<ul>\n";
    $body =~ s/^(.+?)\n\n(.+?)\n\n(.+)$/parse4($title, $1, $2, $3), ''/sge;
    $html_spec .= "</ul>\n";
}

sub parse4 {
    my ($title, $synopsis, $desc, $example) = @_;

    $html_spec .= "<li>";

    my $txt = $synopsis;
    $txt =~ s/M<(.+?)>/parse5($title, 0, $1), ''/sge;
    sub parse5 {
        my ($title, $anchor, $txt) = @_;
        if (not exists $cache->{$title . ":" . $txt}) {
            $html_navi .= "<li>" . mklink($anchor, $txt) . "<\/li>";
            $cache->{$title . ":" . $txt} = 1;
        }
    }

    $html_spec .= "<div class=\"synopsis\">";
    $synopsis =~ s/[ \t]{2,}/ /sg;
    $synopsis = conv(1, $synopsis);
    $synopsis =~ s/(\[|\]|:|\s+=\s+)/<span class=\"meta\">$1<\/span>/sg;
    $synopsis =~ s/;/<\/div><div class="synopsis">/sg;
    $synopsis =~ s/\(\s+/(/sg;
    $synopsis =~ s/\s+\)/)/sg;
    $html_spec .= "$synopsis\n";
    $html_spec .= "</div>";

    $html_spec .= "<div class=\"desc\">";
    $desc = conv(0, $desc);
    $desc =~ s/[ \t]{2,}/ /sg;
    $html_spec .= "$desc\n";
    $html_spec .= "</div>";

    $html_spec .= "<div class=\"example\">";
    $example = conv(0, $example);
    $example =~ s/\n+$//s;
    $example =~ s/^\s+//s;
    $example =~ s/^\s\s//mg;
    $html_spec .= "$example\n";
    $html_spec .= "</div>";

    $html_spec .= "</li>";
}

#   create an id suitable for HTML anchors/hyperlinks
sub mkid {
    my ($id) = @_;
    $id = lc($id);
    $id =~ s/\s+/_/sg;
    $id =~ s/-/_/sg;
    return $id;
}

#   convert text (either with anchors or hyperlinks)
sub conv {
    my ($anchor, $txt) = @_;

    #   convert types
    $txt =~ s/R<(.+?)>/"<span class=\"R\">" . mklink($anchor, $1) . "<\/span>"/sge;
    $txt =~ s/M<(.+?)>/"<span class=\"M\">" . mklink($anchor, $1) . "<\/span>"/sge;
    $txt =~ s/P<(.+?)>/<span class="P">$1<\/span>/sg;
    $txt =~ s/F<(.+?)>/<span class="F">$1<\/span>/sg;
    $txt =~ s/T<(.+?)>/<span class="T">$1<\/span>/sg;
    $txt =~ s/O<(.+?)>/<span class="O">$1<\/span>/sg;
    $txt =~ s/C<(.+?)>/<code>$1<\/code>/sg;
    $txt =~ s/I<(.+?):(\d+)>/<img style="float: right;" src="$1" width="$2"\/>/sg;

    #   convert typography aspects
    $txt =~ s/->/&rarr;/sg;
    $txt =~ s/<-/&larr;/sg;
    $txt =~ s/--/&mdash;/sg;
    $txt =~ s/(FIXME|TODO)/<span class="$1">$1<\/span>/sg;

    #   convert double-type
    sub mklink {
        my ($anchor, $name) = @_;
        my $id = mkid($name);
        if ($anchor) {
            if (not exists $defined->{$id}) {
                $defined->{$id} = 1;
                return "<a name=\"$id\">$name</a>";
            }
            else {
                return "$name";
            }
        }
        else {
            return "<a href=\"#$id\">$name</a>";
        }
    }

    return $txt;
}

#   finish generating
$tmpl =~ s/\@SPEC\@/$html_spec/s;
$tmpl =~ s/\@NAVI\@/$html_navi/s;

#   write result document
$tmpl > io($filename_html);

