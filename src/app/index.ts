import '../styles/globals.scss';
import { createHeader } from '../components/header/header';

const app = document.createElement('div');

app.id = 'app';

const header = createHeader();
const main = document.createElement('main');

app.prepend(header, main);

document.body.append(app);
