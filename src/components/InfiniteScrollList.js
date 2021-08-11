import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';

import throttle from '../utils/throttle';
import CardSkeleton from './CardSkeleton';
import Loader from './Loader';

const THROTTLE_WAIT = 300;

const InfiniteScrollList = () => {
  const [comments, setComments] = useState();
  const [page, setPage] = useState(2);

  useEffect(() => {
    const apiCall = async () => {
      const { data } = await axios.get('https://jsonplaceholder.typicode.com/comments?_page=1&_limit=10');
      setComments(Array.from(data));
    };
    apiCall();
  }, []);

  const [isFetching, setIsFetching] = useState(false);
  const [isReachingEnd, setIsReachingEnd] = useState(false);

  const handleScroll = () => {
    const scrollHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
    const scrollTop = Math.max(document.documentElement.scrollTop, document.body.scrollTop);
    const { clientHeight } = document.documentElement;
    if (clientHeight + scrollTop >= scrollHeight / 2) {
      setIsFetching(true);
    }
  };

  const handleScrollThrottle = throttle(() => {
    handleScroll();
  }, THROTTLE_WAIT);

  const fetchMorePages = () => {
    setTimeout(async () => {
      const { data } = await axios.get(`https://jsonplaceholder.typicode.com/comments?_page=${page}&_limit=10`);

      if (data.length > 0) {
        setComments(comments.concat(data));
        setIsFetching(false);
      } else setIsReachingEnd(true);
    }, 500);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScrollThrottle);

    return () => window.removeEventListener('scroll', handleScrollThrottle);
  }, []);

  useEffect(() => {
    if (!isFetching || isReachingEnd) return;
    setPage(page + 1);
    fetchMorePages();
  }, [isFetching]);

  if (!comments) return <Loader />;

  return (
    <Wrapper>
      {comments.map((comment) => (
        <StyledCard key={comment.id}>
          <div>
            <b>Comment Id</b>&nbsp;&nbsp;{comment.id}
          </div>
          <StyledEmail>
            <b>Email</b>&nbsp;&nbsp;{comment.email}
          </StyledEmail>
          <div>
            <b>Comment</b>
            <br />
            <p>{comment.body}</p>
          </div>
        </StyledCard>
      ))}

      {isFetching &&
        !isReachingEnd &&
        Array(5)
          .fill(0)
          .map((_, i) => <CardSkeleton key={`skeleton-item${i + 1}`} />)}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 33px 0;
`;

const StyledCard = styled.div`
  width: 500px;
  background: #f8f9fa;
  border: 0.5px solid #ced4da;
  box-sizing: border-box;
  border-radius: 20px;
  padding: 20px;
  font-size: 18px;
  margin-bottom: 14px;
`;

const StyledEmail = styled.div`
  margin: 12px 0;
`;

export default InfiniteScrollList;
