
#!/bin/bash
ftp -d thinkpixellab.com << ftpEOF
cd vossler.thinkpixellab.com/html
lcd _site
mput **/*.*
a
bye
ftpEOF

