import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import styled from 'styled-components';

import CardSkeleton from './CardSkeleton';
import Loader from './Loader';

const options = {
  threshold: '0.1',
};

const InfiniteScrollList = () => {
  const [comments, setComments] = useState();
  const [page, setPage] = useState(2);
  const [isFetching, setIsFetching] = useState(false);
  const [isReachingEnd, setIsReachingEnd] = useState(false);

  const lastCommentRef = useRef();

  const fetchMorePages = () => {
    setTimeout(async () => {
      const { data } = await axios.get(`https://jsonplaceholder.typicode.com/comments?_page=${page}&_limit=10`);

      if (data.length > 0) {
        setComments(comments.concat(data));
      } else {
        setIsReachingEnd(true);
      }

      setIsFetching(false);
    }, 200);
  };

  useEffect(() => {
    const apiCall = async () => {
      const { data } = await axios.get('https://jsonplaceholder.typicode.com/comments?_page=1&_limit=10');
      setComments(Array.from(data));
    };
    apiCall();
  }, []);

  useEffect(() => {
    const intersectionObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsFetching(true);
        }
      });
    }, options);

    if (lastCommentRef?.current) {
      intersectionObserver.observe(lastCommentRef.current);
    }

    return () => {
      intersectionObserver?.disconnect(lastCommentRef.current);
    };
  }, [comments?.length]);

  useEffect(() => {
    if (!isFetching || isReachingEnd) return;
    setPage(page + 1);
    fetchMorePages();
  }, [isFetching]);

  if (!comments) return <Loader />;

  return (
    <Wrapper>
      {comments.map((comment, i) =>
        i === comments.length - 1 ? (
          <StyledCard key={comment.id} ref={lastCommentRef}>
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
        ) : (
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
        ),
      )}

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
