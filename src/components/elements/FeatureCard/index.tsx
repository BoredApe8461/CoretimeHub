import {
  Button,
  Card,
  CardActions,
  CardContent,
  Link,
  Typography,
} from '@mui/material';
import Image, { StaticImageData } from 'next/image';
import React from 'react';

import styles from './index.module.scss';

interface FeatureCardProps {
  title: string;
  buttonText: string;
  image: StaticImageData;
  href: string;
}

const FeatureCard = ({ title, buttonText, image, href }: FeatureCardProps) => {
  return (
    <Card className={styles.card}>
      <CardContent>
        <Image className={styles.icon} src={image} alt='' />
      </CardContent>
      <Typography variant='h5' component='h2' gutterBottom>
        {title}
      </Typography>
      <CardActions>
        <Link margin='0 auto' href={href}>
          <Button size='small' variant='text' className={styles.button}>
            {buttonText}
          </Button>
        </Link>
      </CardActions>
    </Card>
  );
};

export default FeatureCard;
