import { Field, Form, Formik } from 'formik';
import { FunctionComponent, useEffect, useState } from 'react';
import { classnames } from 'tailwindcss-classnames';
import * as yup from 'yup';
import Modal from '../../../components/app/Modal';
import Input from '../../../components/Input';
import IconSelect from '../../../components/Input/IconSelect';
import Seo from '../../../components/Seo';
import Table from '../../../components/Table';
import { AllIcons } from '../../../data/Icons';
import { useSession, withAdmin } from '../../../services/auth';
import { db } from '../../../services/realm';

interface Props {}

const InitalEditorState = {
  id: null,
  name: '',
  type: 'hot-drinks',
  icon: '',
  desc: '',
};

const AdminMenuPage: FunctionComponent<Props> = ({ children }) => {
  const { auth } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [initalEditor, setInitalEditor] = useState(InitalEditorState);

  console.log(items);

  const LoadItems = async () => {
    const res = await await db.collection('items').find({});
    setItems(res);
  };

  useEffect(() => {
    LoadItems();
  }, [isOpen]);

  const onSubmitHandler = async (submittedValue) => {
    try {
      const { id, ...values } = submittedValue;
      if (id) {
        await db.collection('items').updateOne(
          { _id: id },
          {
            ...values,
          }
        );
      } else {
        await db.collection('items').insertOne({
          ...values,
        });
      }
    } catch (err) {
      console.log(err);
    } finally {
      setIsOpen(!isOpen);
      setInitalEditor(InitalEditorState);
    }
  };

  return (
    <>
      <Seo titles={['Menu', 'Admin']} />
      <div className='container py-10'>
        <div className='flex items-center'>
          <div className='flex-grow'>
            <h1>Menu</h1>
            <p>Update or add menu items</p>
          </div>
          <div>
            <button
              className='btn btn-primary'
              onClick={() => {
                setIsOpen(!isOpen);
              }}
            >
              New Item
            </button>
          </div>
        </div>
        <Table
          className={classnames('py-4')}
          cols={[
            {
              name: 'Name',
              key: 'name',
              highlight: true,
            },
            {
              name: 'Icon',
              render: (item) => (
                <>
                  <img
                    style={{ maxHeight: 32 }}
                    src={
                      AllIcons.find((icon) => icon?.slug === item?.icon)?.src
                    }
                  />
                </>
              ),
            },
            {
              name: 'Description',
              key: 'desc',
            },
            {
              name: 'Category',
              key: 'type',
            },
            {
              name: 'Actions',
              render: (item) => {
                return (
                  <>
                    <a
                      onClick={async () => {
                        if (
                          window.confirm(
                            `Are you sure you want to delete: ${item?.name}`
                          )
                        ) {
                          db.collection('items')
                            .deleteOne({ _id: item?._id })
                            .then((res) => {
                              LoadItems();
                            });
                        }
                      }}
                      className='mr-3 text-red-600 cursor-pointer hover:text-red-900'
                    >
                      Delete
                    </a>
                    <a
                      onClick={() => {
                        setInitalEditor({ ...item, id: item?._id });
                        setIsOpen(!isOpen);
                      }}
                      className='text-indigo-600 cursor-pointer hover:text-indigo-900'
                    >
                      Edit
                    </a>
                  </>
                );
              },
            },
          ]}
          data={items}
        />
      </div>
      <Modal isOpen={isOpen}>
        <Formik
          onSubmit={onSubmitHandler}
          initialValues={initalEditor}
          validationSchema={yup.object().shape({
            name: yup.string().required('Name is required'),
          })}
        >
          {(props) => (
            <Form className='grid grid-flow-row gap-2'>
              <h1>{props?.values?.['id'] ? 'Edit Item' : 'New Item'}</h1>
              <p>
                {props?.values?.['id']
                  ? `Editing: ${initalEditor?.name}`
                  : 'Create a new item!'}
              </p>
              <div className='h-3' />
              <Field
                name='name'
                label='Name*'
                placeholder='Iced Coffee'
                component={Input}
              />
              <Field
                placeholder='Type'
                name='type'
                type='select'
                component={Input}
              >
                <option value='hot-drinks'>Hot Drinks</option>
                <option value='iced-drinks'>Iced Drinks</option>
                <option value='food'>Food</option>
                <option value='bakery'>Bakery</option>
              </Field>
              <Field
                name='desc'
                label='Description'
                type='textarea'
                placeholder='It really is a serious problem if tea can???t fix it.'
                component={Input}
              />
              <IconSelect name='icon' label='Select Icon' />
              <button
                type='button'
                className='link'
                onClick={() => {
                  // if (window.confirm('Cancel Item')) {
                  setIsOpen(!isOpen);
                  setInitalEditor(InitalEditorState);
                  // }
                }}
              >
                Cancel
              </button>
              <button
                type='submit'
                disabled={props?.isSubmitting}
                className='btn btn-primary'
              >
                {props?.values?.['id'] ? 'Update' : 'Create'}
              </button>
            </Form>
          )}
        </Formik>
      </Modal>
    </>
  );
};

export default withAdmin(AdminMenuPage);
