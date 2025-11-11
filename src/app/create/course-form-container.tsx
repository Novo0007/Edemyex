'use client';

import { useState } from 'react';
import AiOutlineGenerator from '@/components/ai-outline-generator';
import CourseCreationForm from '@/components/course-creation-form';

export default function CourseFormContainer() {
  const [description, setDescription] = useState('');
  const [outline, setOutline] = useState('');

  const handleOutlineChange = (newOutline: string) => {
    setOutline(newOutline);
  };

  return (
    <CourseCreationForm
        outline={outline}
        onDescriptionChange={setDescription}
        onOutlineChange={setOutline}
    >
        <AiOutlineGenerator 
            description={description} 
            onOutlineChange={handleOutlineChange} 
        />
    </CourseCreationForm>
  );
}
