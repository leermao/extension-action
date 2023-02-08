import { execSync } from 'child_process';

execSync('web-ext build -s ./extension-firefox/ -n extension-firefox.zip -a ./ -o', { stdio: 'inherit' });
