import '../styles/globals.scss';

const app = document.createElement('div');

app.id = 'app';

const main = document.createElement('main')

app.prepend(main)
document.body.append(app);


