import './game-developers-section.scss';
import gameDevelopersImage from '../../assets/images/game_developers_section_image.png';
import submitIconImage from '../../assets/icons/submitIcon.svg';

export function createGameDevelopersSection(): HTMLElement {
  const gameDevelopersSection = document.createElement('section');
  gameDevelopersSection.classList.add('gameDevelopersSection', 'container');

  const gameDevelopersSectionImage = document.createElement('img');
  gameDevelopersSectionImage.classList.add('gameDevelopersSectionImage');
  gameDevelopersSectionImage.src = gameDevelopersImage;

  const gameDevelopersInfoBlock = document.createElement('div');
  gameDevelopersInfoBlock.classList.add('gameDevelopersInfoBlock');

  const gameDevelopersInfoBlockTitle = document.createElement('h2');
  gameDevelopersInfoBlockTitle.classList.add('gameDevelopersInfoBlockTitle');
  gameDevelopersInfoBlockTitle.textContent = 'Are You a Game Developer?';

  const gameDevelopersInfoBlockDescription = document.createElement('p');
  gameDevelopersInfoBlockDescription.classList.add('gameDevelopersInfoBlockDescription');
  gameDevelopersInfoBlockDescription.textContent =
    "Want to see your game on MiniGames? We're always looking for fun,\n" +
    'engaging mini games to add to our platform. Submit your game\n' +
    'and reach thousands of players!';

  const gameDevelopersInfoBlockButton = document.createElement('button');
  gameDevelopersInfoBlockButton.type = 'button';
  gameDevelopersInfoBlockButton.classList.add('gameDevelopersInfoBlockButton');
  gameDevelopersInfoBlockButton.textContent = 'Submit  Form';

  const submitIcon = document.createElement('img');
  submitIcon.classList.add('submitIcon');
  submitIcon.alt = 'Submit Icon';
  submitIcon.src = submitIconImage;

  gameDevelopersInfoBlockButton.prepend(submitIcon);

  const gameDevelopersInfoBlockContact = document.createElement('p');
  gameDevelopersInfoBlockContact.classList.add('gameDevelopersInfoBlockContact');
  gameDevelopersInfoBlockContact.textContent = 'or contact us at developers@minigames.com';

  gameDevelopersInfoBlock.append(
    gameDevelopersInfoBlockTitle,
    gameDevelopersInfoBlockDescription,
    gameDevelopersInfoBlockButton,
    gameDevelopersInfoBlockContact,
  );

  gameDevelopersSection.append(gameDevelopersSectionImage, gameDevelopersInfoBlock);

  return gameDevelopersSection;
}
