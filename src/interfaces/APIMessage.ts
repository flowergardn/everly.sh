interface APIMessage {
  content?: string;
  embeds?: Embed[];
  components?: Component[];
}

export interface Embed {
  title?: string;
  description?: string;
  image?: Image;
  color?: number;
}

export interface Component {
  type: number;
  components: Button[];
}

export interface Image {
  url: string;
}

interface Button {
  type: number;
  label: string;
  style: number;
  url: string;
}

export default APIMessage;
