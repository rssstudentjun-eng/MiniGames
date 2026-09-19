import './footer.scss';
import headerLogo from '../../assets/icons/headerLogo.svg';
import chatIcon from '../../assets/icons/chatIcon.svg';
import codeIcon from '../../assets/icons/codeIcon.svg';
import rsIcon from '../../assets/icons/rsIcon.svg';
import rss_feedIcon from '../../assets/icons/rss_feedIcon.svg';
import shareIcon from '../../assets/icons/shareIcon.svg';


interface FooterLinkGroup {
    title: string;
    links: FooterLink[];
}

interface FooterLink {
    label: string;
    href: string;
    icon?: string;
}

const footerLinkGroups: FooterLinkGroup[] = [
    {
        title: 'Explore',
        links: [
            {label: 'Home', href: '/'},
            {label: 'Library', href: '/'},
            {label: 'Categories', href: '/'},
            {label: 'Tournaments', href: '/'},
        ],
    },
    {
        title: 'Company',
        links: [
            {label: 'About Us', href: '/'},
            {label: 'Contact', href: '/'},
            {label: 'Privacy Policy', href: '/'},
            {label: 'Terms of Service', href: '/'},
        ],
    },
    {
        title: 'Community',
        links: [
            {label: 'Share', icon: shareIcon, href: '/'},
            {label: 'Chat', icon: chatIcon, href: '/'},
            {label: 'RSS feed', icon: rss_feedIcon, href: '/'},
        ],
    },
];

function createFooterLinkGroup(group: FooterLinkGroup): HTMLElement {
    const nav = document.createElement('nav');
    nav.className = 'footerLinkGroup';
    nav.setAttribute('aria-label', group.title);

    const title = document.createElement('h3');
    title.className = 'footerLinkGroupTitle';
    title.textContent = group.title;

    const list = document.createElement('ul');
    list.className = 'footerLinkList';

    for (const item of group.links) {
        const li = document.createElement('li');

        const link = document.createElement('a');
        link.className = 'footerLink';

        link.href = item.href;

        if (item.icon) {
            link.classList.add('footerIconLink');
            list.classList.add('footerIconList');
            const icon = document.createElement('img');
            icon.src = item.icon;
            icon.alt = '';
            icon.className = 'footerLinkIcon';

            link.setAttribute('aria-label', item.label);
            link.append(icon);
        } else {
            link.textContent = item.label;
        }

        li.append(link);
        list.append(li);
    }

    nav.append(title, list);

    return nav;
}

export function createFooter(): HTMLElement {
    const footer = document.createElement('footer');
    footer.classList.add('footer', 'container');

    const logoFooter = document.createElement('a');
    logoFooter.classList.add('headerLogoWrap');
    logoFooter.href = '/';

    const logoFooterIcon = document.createElement('img');
    logoFooterIcon.classList.add('headerLogoIcon');
    logoFooterIcon.src = headerLogo;
    logoFooterIcon.alt = 'MiniGames logo';

    const logoText = document.createElement('span');
    logoText.classList.add('footerLogoText');
    logoText.textContent = 'MiniGames';

    logoFooter.append(logoFooterIcon, logoText);

    const topContentWrapper = document.createElement('div')
    topContentWrapper.classList.add('topContentWrapper')

    const topContentDescription = document.createElement('div')
    topContentDescription.classList.add('topContentDescription')

    const description = document.createElement('p')
    description.classList.add('description')

    description.textContent = 'Take a short break and have fun. Hundreds of curated casual mini-games right in your web browser. No download required.'
    topContentDescription.append(logoFooter, description)

    const infoBlock = document.createElement('div');
    infoBlock.className = 'footerLinks';

    for (const group of footerLinkGroups) {
        infoBlock.append(createFooterLinkGroup(group));
    }

    topContentWrapper.append(topContentDescription, infoBlock);

    const bottomContentWrapper = document.createElement('div')
    bottomContentWrapper.classList.add('bottomContentWrapper')

    const copyright = document.createElement('p')
    copyright.classList.add('copyright')
    copyright.textContent = '© 2026 MiniGames. All rights reserved.'

    const courseLink = document.createElement('a')
    courseLink.classList.add('courseLink')
    courseLink.href = 'https://rs.school/courses/short-track'
    courseLink.target = '_blank'

    const rsIconImg = document.createElement('img')
    rsIconImg.src = rsIcon
    rsIconImg.alt = 'RS School Image'
    rsIconImg.classList.add('rsIcon')
    courseLink.textContent = 'RS School'
    courseLink.prepend(rsIconImg)

    const gitHubLink = document.createElement('a')
    gitHubLink.classList.add('gitHubLink')
    gitHubLink.href = 'https://github.com/rssstudentjun-eng'
    gitHubLink.target = '_blank'

    const codeImage = document.createElement('img')
    codeImage.src = codeIcon
    codeImage.alt = 'Code Image'
    codeImage.classList.add('codeImage')
    gitHubLink.textContent = '@rssstudentjun-eng'
    gitHubLink.prepend(codeImage)

    const designInfo = document.createElement('p')
    designInfo.classList.add('designInfo')
    designInfo.textContent = 'Designed with love'

    bottomContentWrapper.append(copyright, courseLink, gitHubLink, designInfo)

    footer.append(topContentWrapper, bottomContentWrapper)

    return footer

}
