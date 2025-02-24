create table `group`
(
    id         int auto_increment
        primary key,
    created_at datetime(6) null,
    updated_at datetime(6) null,
    capacity   int         not null,
    name       varchar(50) not null,
    constraint UKhyl13wj2rpoe8p7d2v8cg3y4e
        unique (name)
);

create table performance
(
    id                  int auto_increment
        primary key,
    cpu                 varchar(255) not null,
    cpu_description     varchar(255) not null,
    memory              varchar(255) not null,
    memory_description  varchar(255) not null,
    storage             varchar(255) not null,
    storage_description varchar(255) not null
);

create table project_image
(
    tag                 varchar(50)  not null
        primary key,
    default_run_command varchar(255) not null,
    language            varchar(20)  not null,
    os                  varchar(20)  not null,
    port                int          not null
);

create table project
(
    id             int auto_increment
        primary key,
    created_at     datetime(6)  null,
    updated_at     datetime(6)  null,
    auto_stop      bit          not null,
    container_id   varchar(255) not null,
    deployment_url varchar(255) not null,
    is_deleted     bit          not null,
    name           varchar(30)  not null,
    node_port      int          not null,
    run_command    varchar(255) not null,
    status         bit          not null,
    group_id       int          not null,
    performance_id int          not null,
    image_tag      varchar(50)  not null,
    constraint FK3uxtobd6oe9ov8rtagsxx95x2
        foreign key (performance_id) references performance (id),
    constraint FKad1t7iofp6e362fj95pp03jqa
        foreign key (group_id) references `group` (id),
    constraint FKrvri00nw7ohwf2qpqqrj611ay
        foreign key (image_tag) references project_image (tag)
);

create table user
(
    id          int auto_increment
        primary key,
    created_at  datetime(6)  null,
    updated_at  datetime(6)  null,
    email       varchar(255) null,
    image       varchar(255) null,
    name        varchar(255) not null,
    provider    varchar(255) not null,
    provider_id varchar(255) not null,
    constraint UKltatj80412esh1fl4nrqmupu6
        unique (provider, provider_id)
);

create table group_user
(
    group_id   int                                 not null,
    user_id    int                                 not null,
    created_at datetime(6)                         null,
    updated_at datetime(6)                         null,
    role       enum ('MANAGER', 'MEMBER', 'OWNER') null,
    primary key (group_id, user_id),
    constraint FK38bp9xrwbn0j9hprsikoq9w92
        foreign key (group_id) references `group` (id),
    constraint FKcusixce3gqeai9r55f98gmtu5
        foreign key (user_id) references user (id)
);

create table project_user
(
    project_id int         not null,
    user_id    int         not null,
    created_at datetime(6) null,
    updated_at datetime(6) null,
    status     bit         not null,
    primary key (project_id, user_id),
    constraint FK4jl2o131jivd80xsuw6pivnbx
        foreign key (user_id) references user (id),
    constraint FK4ug72llnm0n7yafwntgdswl3y
        foreign key (project_id) references project (id)
);



