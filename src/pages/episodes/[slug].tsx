import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import api from '../../services/api';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';

import { usePlayer } from '../../contexts/PlayerContext';

import styles from './episode.module.scss';

const slugs = [
  { slug: 'a-importancia-da-contribuicao-em-open-source' },
  { slug: 'uma-conversa-sobre-programacao-funcional-e-orientacao-a-objetos' },
  { slug: 'barreiras-e-solucoes-propostas-por-micro-servicos' },
  { slug: 'aplicacao-de-arquiteturas-mvc-e-clean-architecture-na-pratica' },
  { slug: 'entrevista-jose-valim-criador-do-elixir' },
  { slug: 'o-que-e-ui-ux' },
  { slug: 'como-virar-lider-desenvolvimento' },
  { slug: 'comunidades-e-tecnologia' },
  { slug: 'typescript-vale-a-pena' },
  { slug: 'estrategias-de-autenticacao-jwt-oauth' },
];

type Episode = {
  id: string;
  title: string;
  members: string;
  publishedAt: string;
  thumbnail: string;
  description: string;
  duration: number;
  durationAsString: string;
  url: string;
};

type EpisodeProps = {
  episode: Episode;
};

export default function Episode({ episode }: EpisodeProps) {
  const { play } = usePlayer();

  return (
    <div className={styles.episode}>
      <Head>
        <title>{episode.title} | Podcastr</title>
      </Head>

      <div className={styles.thumbnailContainer}>
        <Link href="/">
          <button type="button">
            <img src="/arrow-left.svg" alt="Voltar" />
          </button>
        </Link>

        <Image
          width={700}
          height={160}
          src={episode.thumbnail}
          objectFit="cover"
        />

        <button type="button" onClick={() => play(episode)}>
          <img src="/play.svg" alt="Tocar episódio" />
        </button>
      </div>

      <header>
        <h1>{episode.title}</h1>
        <span>{episode.members}</span>
        <span>{episode.publishedAt}</span>
        <span>{episode.durationAsString}</span>
      </header>

      <div
        className={styles.description}
        dangerouslySetInnerHTML={{ __html: episode.description }}
      />
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const response = await api.get('episodes');

  const paths = response.data.map((episode: Episode) => {
    return {
      params: {
        slug: episode.id,
      },
    };
  });

  return {
    paths,
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const { slug } = ctx.params;

  const index = slugs.findIndex((item) => item.slug === slug);

  const response = await api.get(`episodes/${index}`);

  const episode = {
    id: response.data.id,
    title: response.data.title,
    members: response.data.members,
    publishedAt: format(parseISO(response.data.published_at), 'd MMM yy', {
      locale: ptBR,
    }),
    thumbnail: response.data.thumbnail,
    description: response.data.description,
    duration: Number(response.data.file.duration),
    durationAsString: convertDurationToTimeString(
      Number(response.data.file.duration)
    ),
    url: response.data.file.url,
  };

  return {
    props: { episode },
    revalidate: 60 * 60 * 24,
  };
};
