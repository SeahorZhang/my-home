interface ItemTag {
  type: string;
  text: string;
}

interface Item {
  text: string;
  type?: string;
  icon: string;
  desc: string;
  link: string;
  github?: string;
  tags: ItemTag[];
}

export default interface Props {
  text: string;
  items: Item[];
}
