##
##  ComponentJS -- Component System for JavaScript <http://componentjs.com>
##  Copyright (c) 2009-2013 Ralf S. Engelschall <http://engelschall.com>
##
##  This Source Code Form is subject to the terms of the Mozilla Public
##  License, v. 2.0. If a copy of the MPL was not distributed with this
##  file, You can obtain one at http://mozilla.org/MPL/2.0/.
##

use IO::File;

my ($target, $source, $major, $minor, $micro, $date) = @ARGV;

#   assemble all input files
sub assemble ($$$) {
    my ($noheader, $prefix, $source) = @_;
    my $fp = new IO::File "<$source"
        or die "failed to load $source";
    my $txt = ""; $txt .= $_ while (<$fp>);
    $fp->close();
    $txt =~ s/\r\n/\n/sg;
    $txt =~ s/^\s*\/\*[ \t]*\n(\*\*[^\n]*\n)+\*\/[ \t]*\n//s if ($noheader);
    $txt =~ s/^[ \t]*\/\/.*$//mg;
    $txt =~ s/^([ \t]*\n)+//s;
    $txt =~ s/([ \t]*\n)+$/\n\n/s;
    $txt =~ s/^(.+)$/$prefix$1/mg;
    $txt =~ s/([ \t]*)\$include\("(.+?)"\);[ \t]*\n/assemble(1, $1, $2)/sge;
    return $txt;
}
my $js = assemble(0, "", $source);

#   move boolean operators from begin to end of line
#   (especially to make linters more happy)
$js =~ s/
    ([ \t]*)(\n
    [ \t]*)(\&\&|\|\|)([ \t]+)
/
    $1 . " " . $3 . $2 . "  " . $4
/sgxe;

#   move arithmetic operators from begin to end of line
#   (especially to make linters more happy)
$js =~ s/
    ([ \t]*)(\n
    [ \t]*)(-|\+|\?|:)([ \t]+)
/
    $1 . " " . $3 . $2 . " " . $4
/sgxe;

#   replace version information
$js =~ s/(major:\s+)0/$1$major/s;
$js =~ s/(minor:\s+)0/$1$minor/s;
$js =~ s/(micro:\s+)0/$1$micro/s;
$js =~ s/(date:\s+)\d+/$1$date/s;

#   generate assembled output file
my $fp = new IO::File ">$target";
$fp->print($js);
$fp->close();

